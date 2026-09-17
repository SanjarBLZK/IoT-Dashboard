-- ============================================
-- IOT DASHBOARD - SUPABASE DATABASE SCHEMA
-- ============================================
-- Kopieer dit hele bestand in de Supabase SQL Editor
-- en klik op "RUN" om de database op te zetten.
--
-- Deze schema bevat uitsluitend de vier gedefinieerde tabellen:
--   1. sensor_data
--   2. incidents
--   3. users
--   4. settings
-- ============================================


-- ============================================
-- 0. OPRUIMEN VAN OUDE TABELLEN
-- ============================================
-- Alles wat NIET in de nieuwe schema hoort wordt verwijderd.
-- Views en triggers die van deze tabellen afhangen worden meegepakt via CASCADE.

DROP VIEW IF EXISTS rack_overview CASCADE;
DROP VIEW IF EXISTS latest_sensor_readings CASCADE;

DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS racks CASCADE;

-- Herbouw de vier gedefinieerde tabellen vanaf nul, zodat oude kolommen
-- (bv. photo_url, message, warn_temp, ...) verdwijnen.
DROP TABLE IF EXISTS sensor_data CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;


-- ============================================
-- 1. TABELLEN
-- ============================================

-- sensor_data
--   Sensor metingen per rack.
CREATE TABLE sensor_data (
  id         SERIAL PRIMARY KEY,
  rack_id    INTEGER      NOT NULL,
  timestamp  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  temperature DOUBLE PRECISION NOT NULL,
  humidity    DOUBLE PRECISION NOT NULL
);

-- incidents
--   Gebeurtenissen (beweging, geluid, temperatuur).
CREATE TABLE incidents (
  id          SERIAL PRIMARY KEY,
  timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type        VARCHAR(32) NOT NULL
              CHECK (type IN ('beweging', 'geluid', 'temperatuur')),
  image_path  VARCHAR(512),
  description TEXT NOT NULL
);

-- users
--   Gebruikers van het dashboard.
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(32) NOT NULL
                CHECK (role IN ('beheerder', 'docent', 'developer')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- settings
--   Drempelwaarden per rack.
CREATE TABLE settings (
  id                   SERIAL PRIMARY KEY,
  rack_id              INTEGER NOT NULL UNIQUE,
  temp_threshold_high  DOUBLE PRECISION NOT NULL DEFAULT 35.0,
  temp_threshold_low   DOUBLE PRECISION NOT NULL DEFAULT 15.0,
  humidity_threshold   DOUBLE PRECISION NOT NULL DEFAULT 60.0,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================
-- 2. INDEXES
-- ============================================

CREATE INDEX idx_sensor_data_rack_timestamp
  ON sensor_data (rack_id, timestamp DESC);

CREATE INDEX idx_incidents_timestamp
  ON incidents (timestamp DESC);

CREATE INDEX idx_incidents_type
  ON incidents (type);


-- ============================================
-- 3. TRIGGERS
-- ============================================

-- Automatisch settings.updated_at bijhouden bij elke UPDATE.
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
-- 4. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE sensor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents   ENABLE ROW LEVEL SECURITY;
ALTER TABLE users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings    ENABLE ROW LEVEL SECURITY;

-- Public read voor dashboard data (prototype / demo).
CREATE POLICY "public_read_sensor_data"
  ON sensor_data FOR SELECT USING (true);

CREATE POLICY "public_read_incidents"
  ON incidents FOR SELECT USING (true);

CREATE POLICY "public_read_settings"
  ON settings FOR SELECT USING (true);

-- Insert/update van dashboard-data mag door iedereen (prototype).
CREATE POLICY "public_insert_sensor_data"
  ON sensor_data FOR INSERT WITH CHECK (true);

CREATE POLICY "public_insert_incidents"
  ON incidents FOR INSERT WITH CHECK (true);

CREATE POLICY "public_upsert_settings_insert"
  ON settings FOR INSERT WITH CHECK (true);

CREATE POLICY "public_upsert_settings_update"
  ON settings FOR UPDATE USING (true) WITH CHECK (true);

-- Users tabel is gevoelig: alleen dienst-rol kan lezen/schrijven.
-- (Geen public policy; frontend zou hier normaal via een backend praten.)


-- ============================================
-- 5. SEED DATA
-- ============================================

-- Default settings per rack (id 1, 2, 3).
INSERT INTO settings (rack_id, temp_threshold_high, temp_threshold_low, humidity_threshold) VALUES
  (1, 35.0, 15.0, 60.0),
  (2, 35.0, 15.0, 60.0),
  (3, 35.0, 15.0, 60.0);

-- Standaard gebruikers (password_hash is placeholder; vervang in productie).
INSERT INTO users (username, password_hash, role) VALUES
  ('admin',    'REPLACE_WITH_BCRYPT_HASH', 'beheerder'),
  ('docent',   'REPLACE_WITH_BCRYPT_HASH', 'docent'),
  ('dev',      'REPLACE_WITH_BCRYPT_HASH', 'developer');

-- Historische sensor data (laatste 30 minuten, 60 metingen per rack).
INSERT INTO sensor_data (rack_id, temperature, humidity, timestamp)
SELECT
  r.rack_id,
  CASE
    WHEN r.rack_id = 1 THEN 24.0 + (random() * 4)
    WHEN r.rack_id = 2 THEN 28.0 + (random() * 4)
    ELSE 25.0 + (random() * 4)
  END,
  45.0 + (random() * 10),
  NOW() - (interval '30 seconds' * s.series)
FROM (VALUES (1), (2), (3)) AS r(rack_id)
CROSS JOIN generate_series(60, 1, -1) AS s(series);

-- Voorbeeld incidents.
INSERT INTO incidents (type, description, timestamp) VALUES
  ('beweging',    'Beweging gedetecteerd bij ingang serverruimte',      NOW() - interval '5 minutes'),
  ('temperatuur', 'Temperatuur boven drempel in Rack B',                 NOW() - interval '2 hours'),
  ('geluid',      'Ongewoon geluidsniveau gedetecteerd in centrale rij', NOW() - interval '15 minutes');


-- ============================================
-- 6. VERIFICATIE
-- ============================================

SELECT 'sensor_data' AS table_name, COUNT(*) AS row_count FROM sensor_data
UNION ALL SELECT 'incidents', COUNT(*) FROM incidents
UNION ALL SELECT 'users',     COUNT(*) FROM users
UNION ALL SELECT 'settings',  COUNT(*) FROM settings;
