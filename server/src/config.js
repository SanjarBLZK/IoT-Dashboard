/**
 * Configuratie uit environment variabelen, met validatie bij het opstarten.
 *
 * De server weigert te starten bij ontbrekende of onveilige secrets. Liever
 * meteen een duidelijke foutmelding dan een draaiende server die kwetsbaar is.
 */

const REQUIRED = ["MARIADB_PASSWORD", "JWT_SECRET"];

// Waarden die duidelijk placeholders zijn en nooit in gebruik mogen zijn.
const FORBIDDEN_SECRETS = [
  "changeme",
  "change_me",
  "secret",
  "password",
  "mariadb",
  "mysql",
  "root",
  "verander_dit",
  "your_secret_here",
];

function fail(message) {
  console.error(`\n❌ Configuratiefout: ${message}\n`);
  process.exit(1);
}

for (const key of REQUIRED) {
  if (!process.env[key] || process.env[key].trim() === "") {
    fail(
      `${key} is niet gezet.\n` +
        `   Maak een .env bestand aan (zie .env.example) en vul een eigen waarde in.`
    );
  }
}

const jwtSecret = process.env.JWT_SECRET.trim();

if (jwtSecret.length < 32) {
  fail(
    "JWT_SECRET is te kort (minimaal 32 tekens).\n" +
      "   Genereer een sterke waarde met:  openssl rand -base64 48"
  );
}

if (FORBIDDEN_SECRETS.includes(jwtSecret.toLowerCase())) {
  fail(
    "JWT_SECRET is een standaard placeholder. Gebruik een eigen, willekeurige waarde.\n" +
      "   Genereer die met:  openssl rand -base64 48"
  );
}

if (FORBIDDEN_SECRETS.includes(process.env.MARIADB_PASSWORD.trim().toLowerCase())) {
  fail(
    "MARIADB_PASSWORD is een standaard placeholder. Kies een eigen wachtwoord."
  );
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? "production",

  db: {
    host: process.env.MARIADB_HOST ?? "db",
    port: Number(process.env.MARIADB_PORT ?? 3306),
    database: process.env.MARIADB_DATABASE ?? "iot_dashboard",
    user: process.env.MARIADB_USER ?? "iot_user",
    password: process.env.MARIADB_PASSWORD,
  },

  jwtSecret,

  // Sessieduur. "Onthoud mij" gebruikt de lange variant.
  session: {
    shortHours: 12,
    rememberDays: 30,
  },

  // Maximaal aantal sensor-metingen dat bewaard blijft. Oudere records
  // worden na elke insert opgeruimd (zie db.js -> enforceSensorLimit).
  sensorLogLimit: Number(process.env.SENSOR_LOG_LIMIT ?? 500),

  // Interval waarmee nieuwe sensormetingen worden gegenereerd (ms).
  sensorIntervalMs: Number(process.env.SENSOR_INTERVAL_MS ?? 60_000),

  // Of de ingebouwde simulator moet draaien. Zet op "false" zodra er echte
  // sensoren via POST /api/sensors aanleveren.
  simulatorEnabled: (process.env.SIMULATOR_ENABLED ?? "true") !== "false",
};

/**
 * Rack metadata die de backend nodig heeft voor incident-beschrijvingen.
 * De volledige weergave-informatie (locatie, apparaten) staat in de frontend,
 * omdat er bewust geen `racks` tabel is.
 */
export const RACKS = [
  { id: 1, name: "Rack A", baseTemp: 24.5, baseHumidity: 45 },
  { id: 2, name: "Rack B", baseTemp: 29.2, baseHumidity: 52 },
  { id: 3, name: "Rack C", baseTemp: 26.8, baseHumidity: 48 },
];
