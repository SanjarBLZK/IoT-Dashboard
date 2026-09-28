import { query } from "./db.js";
import { config, RACKS } from "./config.js";

/**
 * Sensor simulator.
 *
 * Draait op de SERVER, niet in de browser. Daardoor zien alle apparaten
 * exact dezelfde metingen en incidents. Zou elke browser zelf simuleren,
 * dan zou iedereen andere cijfers zien en zouden ze elkaars logs vervuilen.
 *
 * Vervangen door echte hardware? Zet SIMULATOR_ENABLED=false en laat de
 * sensoren POST /api/sensors aanroepen.
 */

// Marge (in °C) waarbinnen een temperatuur al als "warn" geldt.
const WARN_MARGIN_C = 3;
// Marge (in %) voor luchtvochtigheid.
const HUMIDITY_WARN_MARGIN = 5;

// Onthoudt welke racks al kritiek waren, zodat we niet elke minuut opnieuw
// een incident aanmaken voor dezelfde situatie.
const criticalRacks = new Set();

let sensorTimer = null;
let motionTimer = null;

function randomBetween(min, max, decimals = 1) {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

/**
 * Leid de status af uit een meting en de drempelwaarden van dat rack.
 * Dezelfde logica als in de frontend, zodat weergave en alarmen kloppen.
 */
export function deriveStatus(temperature, humidity, thresholds) {
  const { tempThresholdHigh, tempThresholdLow, humidityThreshold } = thresholds;

  if (temperature >= tempThresholdHigh || temperature <= tempThresholdLow) {
    return "critical";
  }
  if (humidity > humidityThreshold) {
    return "critical";
  }
  if (
    temperature >= tempThresholdHigh - WARN_MARGIN_C ||
    temperature <= tempThresholdLow + WARN_MARGIN_C ||
    humidity > humidityThreshold - HUMIDITY_WARN_MARGIN
  ) {
    return "warn";
  }
  return "ok";
}

async function loadThresholds() {
  const result = await query(
    `SELECT rack_id, temp_threshold_high, temp_threshold_low, humidity_threshold
     FROM settings`
  );

  const map = new Map();
  for (const row of result.rows) {
    map.set(row.rack_id, {
      tempThresholdHigh: Number(row.temp_threshold_high),
      tempThresholdLow: Number(row.temp_threshold_low),
      humidityThreshold: Number(row.humidity_threshold),
    });
  }
  return map;
}

/** Laatste meting per rack, als startpunt voor de volgende waarde. */
async function loadLatestReadings() {
  const result = await query(
    `SELECT DISTINCT ON (rack_id) rack_id, temperature, humidity
     FROM sensor_data
     ORDER BY rack_id, timestamp DESC, id DESC`
  );

  const map = new Map();
  for (const row of result.rows) {
    map.set(row.rack_id, {
      temperature: Number(row.temperature),
      humidity: Number(row.humidity),
    });
  }
  return map;
}

async function createIncident(type, description, imagePath = null) {
  const result = await query(
    `INSERT INTO incidents (type, description, image_path)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [type, description, imagePath]
  );
  return result.rows[0].id;
}

/**
 * Genereer een nieuwe meting per rack en sla die op.
 * Controleer daarna of er een temperatuur-incident bij hoort.
 */
async function tickSensors() {
  try {
    const thresholds = await loadThresholds();
    const latest = await loadLatestReadings();

    for (const rack of RACKS) {
      const previous = latest.get(rack.id) ?? {
        temperature: rack.baseTemp,
        humidity: rack.baseHumidity,
      };

      const temperature = Number(
        (previous.temperature + randomBetween(-0.4, 0.4)).toFixed(1)
      );
      const humidity = Number(
        (previous.humidity + randomBetween(-0.3, 0.3)).toFixed(1)
      );

      await query(
        `INSERT INTO sensor_data (rack_id, temperature, humidity)
         VALUES ($1, $2, $3)`,
        [rack.id, temperature, humidity]
      );

      // Drempelcontrole
      const rackThresholds = thresholds.get(rack.id);
      if (!rackThresholds) continue;

      const status = deriveStatus(temperature, humidity, rackThresholds);

      if (status === "critical" && !criticalRacks.has(rack.id)) {
        criticalRacks.add(rack.id);
        await createIncident(
          "temperatuur",
          `Kritieke waarde gedetecteerd in ${rack.name}: ` +
            `${temperature.toFixed(1)}°C, ${humidity.toFixed(1)}% luchtvochtigheid`
        );
        console.log(`🚨 Kritiek incident vastgelegd voor ${rack.name}`);
      } else if (status !== "critical" && criticalRacks.has(rack.id)) {
        // Weer binnen de marges: opnieuw alarmeren mag volgende keer.
        criticalRacks.delete(rack.id);
      }
    }
  } catch (err) {
    console.error("❌ Fout in sensor simulatie:", err.message);
  }
}

/** Willekeurige bewegingsdetectie, net als voorheen 45-90 seconden. */
async function tickMotion() {
  try {
    const locations = [
      "Noordzijde serverruimte",
      "Centrale rij",
      "Zuidzijde serverruimte",
      "Ingang serverruimte",
    ];
    const location = locations[Math.floor(Math.random() * locations.length)];

    await createIncident(
      "beweging",
      `Beweging gedetecteerd: ${location} - Foto automatisch opgeslagen`,
      "/serverroom.jpg"
    );
  } catch (err) {
    console.error("❌ Fout bij bewegingsincident:", err.message);
  } finally {
    scheduleMotion();
  }
}

function scheduleMotion() {
  const delay = randomBetween(45_000, 90_000, 0);
  motionTimer = setTimeout(tickMotion, delay);
}

/**
 * Vul de database met historie als die nog leeg is, zodat de grafieken niet
 * leeg beginnen. Genereert per rack een reeks metingen tot aan de 500-limiet.
 */
async function seedHistoryIfEmpty() {
  const result = await query("SELECT COUNT(*)::int AS count FROM sensor_data");
  if (result.rows[0].count > 0) {
    console.log(`📊 ${result.rows[0].count} bestaande metingen gevonden`);
    return;
  }

  // Verdeel de 500 beschikbare plekken over de racks.
  const perRack = Math.floor(config.sensorLogLimit / RACKS.length);
  console.log(`🌱 Database is leeg, ${perRack} metingen per rack aanmaken...`);

  for (const rack of RACKS) {
    let temperature = rack.baseTemp;
    let humidity = rack.baseHumidity;

    const rows = [];
    for (let i = perRack - 1; i >= 0; i--) {
      temperature = Number((temperature + randomBetween(-0.2, 0.2)).toFixed(1));
      humidity = Number((humidity + randomBetween(-0.3, 0.3)).toFixed(1));
      rows.push({
        timestamp: new Date(Date.now() - i * config.sensorIntervalMs),
        temperature,
        humidity,
      });
    }

    // Een INSERT met meerdere rijen, zodat de limiet-trigger maar een keer
    // hoeft te draaien.
    const values = [];
    const params = [];
    rows.forEach((row, index) => {
      const base = index * 4;
      values.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`);
      params.push(rack.id, row.timestamp, row.temperature, row.humidity);
    });

    await query(
      `INSERT INTO sensor_data (rack_id, timestamp, temperature, humidity)
       VALUES ${values.join(", ")}`,
      params
    );
  }

  console.log("✅ Historische metingen aangemaakt");
}

export async function startSimulator() {
  if (!config.simulatorEnabled) {
    console.log(
      "⏸️  Simulator staat uit (SIMULATOR_ENABLED=false). " +
        "Verwacht metingen via POST /api/sensors."
    );
    return;
  }

  await seedHistoryIfEmpty();

  // Eerste meting direct, daarna op interval.
  await tickSensors();
  sensorTimer = setInterval(tickSensors, config.sensorIntervalMs);
  scheduleMotion();

  console.log(
    `▶️  Simulator actief: meting elke ${config.sensorIntervalMs / 1000}s, ` +
      `maximaal ${config.sensorLogLimit} metingen bewaard`
  );
}

export function stopSimulator() {
  if (sensorTimer) clearInterval(sensorTimer);
  if (motionTimer) clearTimeout(motionTimer);
}
