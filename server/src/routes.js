import express from "express";
import { query, insertSensorReading } from "./db.js";
import { requireAuth } from "./auth.js";
import { config } from "./config.js";

export const apiRouter = express.Router();

// Alles hieronder vereist een geldige sessie.
apiRouter.use(requireAuth);

// ===========================================================================
// SETTINGS
// ---------------------------------------------------------------------------
// Drempelwaarden zijn GEDEELD: een rij per rack, niet per gebruiker. Past
// iemand iets aan, dan krijgen alle apparaten bij hun volgende ophaalactie
// dezelfde waarde.
// ===========================================================================

function toSettings(row) {
  return {
    rackId: row.rack_id,
    tempThresholdHigh: Number(row.temp_threshold_high),
    tempThresholdLow: Number(row.temp_threshold_low),
    humidityThreshold: Number(row.humidity_threshold),
    updatedAt: row.updated_at,
  };
}

const SETTINGS_COLUMNS = `rack_id, temp_threshold_high, temp_threshold_low,
                          humidity_threshold, updated_at`;

// GET /api/settings
apiRouter.get("/settings", async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT ${SETTINGS_COLUMNS} FROM settings ORDER BY rack_id`
    );
    res.json({ settings: rows.map(toSettings) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/settings/:rackId
apiRouter.put("/settings/:rackId", async (req, res, next) => {
  try {
    const rackId = Number(req.params.rackId);
    if (!Number.isInteger(rackId) || rackId < 1) {
      return res.status(400).json({ error: "Ongeldig rack id." });
    }

    const { tempThresholdHigh, tempThresholdLow, humidityThreshold } =
      req.body ?? {};

    const values = { tempThresholdHigh, tempThresholdLow, humidityThreshold };
    for (const [key, value] of Object.entries(values)) {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        return res.status(400).json({ error: `${key} moet een getal zijn.` });
      }
    }

    if (tempThresholdHigh <= tempThresholdLow) {
      return res.status(400).json({
        error: "Maximale temperatuur moet hoger zijn dan de minimale temperatuur.",
      });
    }
    if (humidityThreshold < 0 || humidityThreshold > 100) {
      return res
        .status(400)
        .json({ error: "Luchtvochtigheidsdrempel moet tussen 0 en 100 liggen." });
    }

    // MariaDB-variant van een upsert. De unieke index op rack_id zorgt dat
    // een bestaande rij wordt bijgewerkt in plaats van gedupliceerd.
    await query(
      `INSERT INTO settings
         (rack_id, temp_threshold_high, temp_threshold_low, humidity_threshold)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         temp_threshold_high = VALUES(temp_threshold_high),
         temp_threshold_low  = VALUES(temp_threshold_low),
         humidity_threshold  = VALUES(humidity_threshold)`,
      [rackId, tempThresholdHigh, tempThresholdLow, humidityThreshold]
    );

    // Geen RETURNING in MariaDB bij een upsert: rij daarna teruglezen.
    const rows = await query(
      `SELECT ${SETTINGS_COLUMNS} FROM settings WHERE rack_id = ?`,
      [rackId]
    );

    console.log(
      `⚙️  Drempelwaarden rack ${rackId} aangepast door ${req.user.username}`
    );
    res.json({ settings: toSettings(rows[0]) });
  } catch (err) {
    next(err);
  }
});

// ===========================================================================
// SENSOR DATA
// ---------------------------------------------------------------------------
// Er blijven maximaal 500 metingen bewaard; insertSensorReading() ruimt na
// elke insert de oudste op.
// ===========================================================================

// GET /api/sensors
//   Geeft alle bewaarde metingen, gegroepeerd per rack en oplopend in tijd.
apiRouter.get("/sensors", async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT rack_id, \`timestamp\`, temperature, humidity
       FROM sensor_data
       ORDER BY \`timestamp\` ASC, id ASC`
    );

    const byRack = {};
    for (const row of rows) {
      const rackId = row.rack_id;
      byRack[rackId] ??= [];
      byRack[rackId].push({
        timestamp: row.timestamp,
        temperature: Number(row.temperature),
        humidity: Number(row.humidity),
      });
    }

    res.json({ readings: byRack, logLimit: config.sensorLogLimit });
  } catch (err) {
    next(err);
  }
});

// POST /api/sensors
//   Endpoint voor echte sensoren. Zet SIMULATOR_ENABLED=false zodra hier
//   hardware op aanlevert, anders vermengen simulatie en echte metingen.
apiRouter.post("/sensors", async (req, res, next) => {
  try {
    const { rackId, temperature, humidity } = req.body ?? {};

    if (!Number.isInteger(rackId) || rackId < 1) {
      return res.status(400).json({ error: "rackId moet een geheel getal zijn." });
    }
    if (typeof temperature !== "number" || !Number.isFinite(temperature)) {
      return res.status(400).json({ error: "temperature moet een getal zijn." });
    }
    if (typeof humidity !== "number" || !Number.isFinite(humidity)) {
      return res.status(400).json({ error: "humidity moet een getal zijn." });
    }

    const insertId = await insertSensorReading(rackId, temperature, humidity);

    const rows = await query(
      `SELECT id, rack_id, \`timestamp\`, temperature, humidity
       FROM sensor_data WHERE id = ?`,
      [insertId]
    );

    res.status(201).json({ reading: rows[0] });
  } catch (err) {
    next(err);
  }
});

// ===========================================================================
// INCIDENTS
// ===========================================================================

function toIncident(row) {
  return {
    id: row.id,
    timestamp: row.timestamp,
    type: row.type,
    description: row.description,
    imagePath: row.image_path,
  };
}

// GET /api/incidents?limit=50
apiRouter.get("/incidents", async (req, res, next) => {
  try {
    // MariaDB accepteert geen placeholder op de LIMIT-positie bij een
    // prepared statement, dus we klemmen de waarde vast tot een geheel
    // getal en zetten die direct in de query.
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const safeLimit = Math.floor(limit);

    const rows = await query(
      `SELECT id, \`timestamp\`, type, image_path, description
       FROM incidents
       ORDER BY \`timestamp\` DESC, id DESC
       LIMIT ${safeLimit}`
    );

    res.json({ incidents: rows.map(toIncident) });
  } catch (err) {
    next(err);
  }
});

// POST /api/incidents
apiRouter.post("/incidents", async (req, res, next) => {
  try {
    const { type, description, imagePath = null } = req.body ?? {};

    const allowed = ["beweging", "geluid", "temperatuur"];
    if (!allowed.includes(type)) {
      return res
        .status(400)
        .json({ error: `type moet een van: ${allowed.join(", ")}` });
    }
    if (typeof description !== "string" || description.trim() === "") {
      return res.status(400).json({ error: "description is verplicht." });
    }

    const result = await query(
      `INSERT INTO incidents (type, description, image_path)
       VALUES (?, ?, ?)`,
      [type, description.trim(), imagePath]
    );

    const rows = await query(
      `SELECT id, \`timestamp\`, type, image_path, description
       FROM incidents WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({ incident: toIncident(rows[0]) });
  } catch (err) {
    next(err);
  }
});
