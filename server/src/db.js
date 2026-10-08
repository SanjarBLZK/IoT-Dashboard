import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import { config } from "./config.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  // Sla DATETIME op en lees het terug als UTC, zodat tijdstempels niet
  // verschuiven door de tijdzone van de server of de container.
  timezone: "Z",

  // Getallen als JS number teruggeven in plaats van string.
  decimalNumbers: true,

  // Bewust uit: staat meerdere statements per query toe en vergroot daarmee
  // de impact van een eventuele SQL-injectie. Het schema wordt via een
  // aparte, kortlevende verbinding uitgevoerd (zie initDatabase).
  multipleStatements: false,
});

// Elke nieuwe verbinding op UTC zetten.
pool.on("connection", (connection) => {
  connection.query("SET time_zone = '+00:00'");
});

/**
 * Voer een query uit met parameters.
 *
 * Gebruik altijd `?` placeholders en nooit string-concatenatie, om
 * SQL-injectie te voorkomen.
 *
 * Returns:
 *   - SELECT           -> array met rijen
 *   - INSERT/UPDATE/DELETE -> object met o.a. `insertId` en `affectedRows`
 */
export async function query(sql, params = []) {
  const [result] = await pool.execute(sql, params);
  return result;
}

/**
 * Wacht tot MariaDB bereikbaar is.
 *
 * Bij `docker compose up` start de API vaak sneller dan de database klaar is.
 * Daarom proberen we het een aantal keer opnieuw in plaats van direct te
 * crashen.
 */
async function waitForDatabase(maxAttempts = 30, delayMs = 2000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await pool.query("SELECT 1");
      console.log("✅ Verbonden met MariaDB");
      return;
    } catch (err) {
      if (attempt === maxAttempts) {
        throw new Error(
          `Kon na ${maxAttempts} pogingen geen verbinding maken met MariaDB: ${err.message}`
        );
      }
      console.log(`⏳ Wachten op MariaDB (poging ${attempt}/${maxAttempts})...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

/**
 * Maak verbinding en voer het schema uit. Idempotent: veilig bij elke start.
 *
 * Het schema bestaat uit meerdere statements. In plaats van de hoofdpool met
 * `multipleStatements` aan te zetten, openen we hier eenmalig een aparte
 * verbinding die dat wel mag. Die sluit daarna direct weer.
 */
export async function initDatabase() {
  await waitForDatabase();

  const schema = await readFile(join(__dirname, "schema.sql"), "utf8");

  const migrationConnection = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password,
    multipleStatements: true,
  });

  try {
    await migrationConnection.query("SET time_zone = '+00:00'");
    await migrationConnection.query(schema);
    console.log("✅ Databaseschema gecontroleerd en bijgewerkt");
  } finally {
    await migrationConnection.end();
  }
}

/**
 * Houd `sensor_data` op maximaal `config.sensorLogLimit` rijen door de oudste
 * te verwijderen.
 *
 * Dit gebeurt in de applicatie omdat MariaDB een trigger niet toestaat de
 * tabel te muteren waarop die trigger staat (fout 1442). Alle inserts lopen
 * via de API, dus de limiet wordt overal toegepast.
 *
 * Werkwijze: zoek het id van de N-de nieuwste meting en gooi alles ouder weg.
 * Dat is een indexscan op de primary key, dus goedkoop. `id` is
 * AUTO_INCREMENT en dus oplopend in de tijd.
 *
 * Returns: aantal verwijderde rijen.
 */
export async function enforceSensorLimit(limit = config.sensorLogLimit) {
  // Inline in de SQL, maar eerst hard naar een veilig geheel getal.
  // MariaDB accepteert geen placeholder op de OFFSET-positie.
  const safeLimit = Math.max(1, Math.floor(Number(limit) || 500));

  const rows = await query(
    `SELECT id FROM sensor_data
     ORDER BY id DESC
     LIMIT 1 OFFSET ${safeLimit - 1}`
  );

  // Minder rijen dan de limiet: niets te doen.
  if (rows.length === 0) return 0;

  const result = await query("DELETE FROM sensor_data WHERE id < ?", [
    rows[0].id,
  ]);

  return result.affectedRows ?? 0;
}

/**
 * Sla een meting op en pas daarna direct de 500-limiet toe.
 * Gebruik deze functie voor elke nieuwe meting, zodat de limiet nooit
 * per ongeluk wordt overgeslagen.
 */
export async function insertSensorReading(rackId, temperature, humidity) {
  const result = await query(
    `INSERT INTO sensor_data (rack_id, temperature, humidity)
     VALUES (?, ?, ?)`,
    [rackId, temperature, humidity]
  );

  await enforceSensorLimit();
  return result.insertId;
}

export async function closeDatabase() {
  await pool.end();
}
