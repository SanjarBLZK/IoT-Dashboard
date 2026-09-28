import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { config } from "./config.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const pool = new pg.Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

pool.on("error", (err) => {
  console.error("❌ Onverwachte fout op idle database connectie:", err.message);
});

/**
 * Korte helper voor queries. Gebruik altijd parameters ($1, $2, ...) en nooit
 * string-concatenatie, om SQL-injectie te voorkomen.
 */
export function query(text, params) {
  return pool.query(text, params);
}

/**
 * Wacht tot PostgreSQL bereikbaar is.
 *
 * Bij `docker compose up` start de API vaak sneller dan de database klaar is.
 * Daarom proberen we het een aantal keer opnieuw in plaats van direct te
 * crashen.
 */
async function waitForDatabase(maxAttempts = 30, delayMs = 2000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await pool.query("SELECT 1");
      console.log("✅ Verbonden met PostgreSQL");
      return;
    } catch (err) {
      if (attempt === maxAttempts) {
        throw new Error(
          `Kon na ${maxAttempts} pogingen geen verbinding maken met PostgreSQL: ${err.message}`
        );
      }
      console.log(
        `⏳ Wachten op PostgreSQL (poging ${attempt}/${maxAttempts})...`
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

/**
 * Maak verbinding en voer het schema uit. Idempotent: veilig bij elke start.
 */
export async function initDatabase() {
  await waitForDatabase();

  const schema = await readFile(join(__dirname, "schema.sql"), "utf8");
  await pool.query(schema);
  console.log("✅ Databaseschema gecontroleerd en bijgewerkt");
}

export async function closeDatabase() {
  await pool.end();
}
