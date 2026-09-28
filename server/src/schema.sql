-- ============================================
-- IOT DASHBOARD - POSTGRESQL SCHEMA
-- ============================================
-- Wordt bij elke start van de API uitgevoerd. Alles is idempotent, dus
-- herhaald draaien is veilig en verandert bestaande data niet.
--
-- Vier tabellen: users, settings, sensor_data, incidents.
-- ============================================


-- ============================================
-- users
--   Accounts om in te loggen. Geen rollen: elk account is gelijk.
--   password_hash bevat een bcrypt hash, gemaakt door de API.
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(64)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  last_login    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);


-- ============================================
-- settings
--   Drempelwaarden per rack. Deze zijn GEDEELD: er is precies een rij per
--   rack, niet een rij per gebruiker. Wijzigt iemand een waarde, dan zien
--   alle apparaten dezelfde nieuwe waarde.
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  id                  SERIAL PRIMARY KEY,
  rack_id             INTEGER NOT NULL UNIQUE,
  temp_threshold_high DOUBLE PRECISION NOT NULL DEFAULT 35.0,
  temp_threshold_low  DOUBLE PRECISION NOT NULL DEFAULT 15.0,
  humidity_threshold  DOUBLE PRECISION NOT NULL DEFAULT 60.0,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_temp_range CHECK (temp_threshold_high > temp_threshold_low)
);

-- Houd updated_at automatisch bij, zodat clients kunnen zien of er iets
-- gewijzigd is sinds hun laatste ophaalactie.
CREATE OR REPLACE FUNCTION set_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_settings_updated_at ON settings;
CREATE TRIGGER trg_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION set_settings_updated_at();


-- ============================================
-- sensor_data
--   Alle sensormetingen. Er blijven maximaal 500 records bewaard; bij nieuwe
--   metingen verdwijnen automatisch de oudste (zie trigger hieronder).
-- ============================================
CREATE TABLE IF NOT EXISTS sensor_data (
  id          SERIAL PRIMARY KEY,
  rack_id     INTEGER          NOT NULL,
  timestamp   TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  temperature DOUBLE PRECISION NOT NULL,
  humidity    DOUBLE PRECISION NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sensor_data_rack_timestamp
  ON sensor_data (rack_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_sensor_data_timestamp
  ON sensor_data (timestamp DESC);

-- Rolling window: houd alleen de nieuwste 500 metingen.
--
-- Statement-level trigger (FOR EACH STATEMENT), dus de opruiming gebeurt een
-- keer per INSERT-opdracht in plaats van een keer per rij. Dat is een stuk
-- efficienter wanneer meerdere metingen in een keer worden ingevoegd.
CREATE OR REPLACE FUNCTION enforce_sensor_data_limit()
RETURNS TRIGGER AS $$
DECLARE
  max_rows CONSTANT INTEGER := 500;
BEGIN
  DELETE FROM sensor_data
  WHERE id IN (
    SELECT id
    FROM sensor_data
    ORDER BY timestamp DESC, id DESC
    OFFSET max_rows
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sensor_data_limit ON sensor_data;
CREATE TRIGGER trg_sensor_data_limit
  AFTER INSERT ON sensor_data
  FOR EACH STATEMENT
  EXECUTE FUNCTION enforce_sensor_data_limit();


-- ============================================
-- incidents
--   Gebeurtenissen: beweging, geluid of temperatuur.
-- ============================================
CREATE TABLE IF NOT EXISTS incidents (
  id          SERIAL PRIMARY KEY,
  timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type        VARCHAR(32) NOT NULL
              CHECK (type IN ('beweging', 'geluid', 'temperatuur')),
  image_path  VARCHAR(512),
  description TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_incidents_timestamp
  ON incidents (timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_incidents_type
  ON incidents (type);


-- ============================================
-- Standaard drempelwaarden voor rack 1, 2 en 3.
-- ON CONFLICT: bestaande, door de gebruiker aangepaste waarden blijven staan.
-- ============================================
INSERT INTO settings (rack_id, temp_threshold_high, temp_threshold_low, humidity_threshold)
VALUES
  (1, 35.0, 15.0, 60.0),
  (2, 35.0, 15.0, 60.0),
  (3, 35.0, 15.0, 60.0)
ON CONFLICT (rack_id) DO NOTHING;
