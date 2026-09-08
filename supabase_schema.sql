-- ============================================
-- IOT DASHBOARD - SUPABASE DATABASE SCHEMA
-- ============================================
-- Copy-paste dit hele bestand in Supabase SQL Editor
-- en klik op "RUN" om de database op te zetten
-- ============================================

-- ============================================
-- 1. TABELLEN AANMAKEN
-- ============================================

-- RACKS TABLE
-- Bevat informatie over server racks
CREATE TABLE IF NOT EXISTS racks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  location VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- SENSOR_DATA TABLE  
-- Bevat alle sensor metingen
CREATE TABLE IF NOT EXISTS sensor_data (
  id SERIAL PRIMARY KEY,
  rack_id INTEGER NOT NULL REFERENCES racks(id) ON DELETE CASCADE,
  temperature DECIMAL(5,2) NOT NULL,
  humidity DECIMAL(5,2) NOT NULL,
  sound_level DECIMAL(5,2),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- DEVICES TABLE
-- Apparaten in elk rack
CREATE TABLE IF NOT EXISTS devices (
  id SERIAL PRIMARY KEY,
  rack_id INTEGER NOT NULL REFERENCES racks(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'online',
  created_at TIMESTAMP DEFAULT NOW()
);

-- INCIDENTS TABLE
-- Bevat bewegingsdetectie en alarm events
CREATE TABLE IF NOT EXISTS incidents (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('motion', 'alarm', 'resolved')),
  rack_id INTEGER REFERENCES racks(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  photo_url TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- SETTINGS TABLE
-- Configureerbare drempelwaarden per rack
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  rack_id INTEGER NOT NULL UNIQUE REFERENCES racks(id) ON DELETE CASCADE,
  temp_warning_threshold DECIMAL(5,2) DEFAULT 28.0,
  temp_critical_threshold DECIMAL(5,2) DEFAULT 35.0,
  humidity_max_threshold DECIMAL(5,2) DEFAULT 60.0,
  humidity_min_threshold DECIMAL(5,2) DEFAULT 40.0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. INDEXES VOOR PERFORMANCE
-- ============================================

-- Index voor snelle sensor data queries
CREATE INDEX IF NOT EXISTS idx_sensor_data_rack_timestamp 
ON sensor_data(rack_id, timestamp DESC);

-- Index voor incident queries
CREATE INDEX IF NOT EXISTS idx_incidents_timestamp 
ON incidents(timestamp DESC);

-- Index voor device lookups
CREATE INDEX IF NOT EXISTS idx_devices_rack_id 
ON devices(rack_id);

-- ============================================
-- 3. VIEWS
-- ============================================

-- View voor laatste sensor reading per rack
CREATE OR REPLACE VIEW latest_sensor_readings AS
SELECT DISTINCT ON (rack_id)
  rack_id,
  temperature,
  humidity,
  sound_level,
  timestamp
FROM sensor_data
ORDER BY rack_id, timestamp DESC;

-- View voor rack overzicht met laatste data
CREATE OR REPLACE VIEW rack_overview AS
SELECT 
  r.id,
  r.name,
  r.location,
  COALESCE(lsr.temperature, 20.0) as temperature,
  COALESCE(lsr.humidity, 50.0) as humidity,
  lsr.sound_level,
  lsr.timestamp as last_reading,
  CASE 
    WHEN lsr.temperature >= COALESCE(s.temp_critical_threshold, 35.0) THEN 'critical'
    WHEN lsr.temperature >= COALESCE(s.temp_warning_threshold, 28.0) THEN 'warn'
    ELSE 'ok'
  END as status,
  (SELECT COUNT(*) FROM devices d WHERE d.rack_id = r.id AND d.status = 'online') as active_devices
FROM racks r
LEFT JOIN latest_sensor_readings lsr ON r.id = lsr.rack_id
LEFT JOIN settings s ON r.id = s.rack_id;

-- ============================================
-- 4. FUNCTIONS & TRIGGERS
-- ============================================

-- Functie om automatisch updated_at bij te werken
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger voor racks tabel
DROP TRIGGER IF EXISTS update_racks_updated_at ON racks;
CREATE TRIGGER update_racks_updated_at 
BEFORE UPDATE ON racks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger voor settings tabel
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at 
BEFORE UPDATE ON settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS op alle tabellen
ALTER TABLE racks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (voor herbruikbaarheid)
DROP POLICY IF EXISTS "Allow public read on racks" ON racks;
DROP POLICY IF EXISTS "Allow public read on sensor_data" ON sensor_data;
DROP POLICY IF EXISTS "Allow public read on devices" ON devices;
DROP POLICY IF EXISTS "Allow public read on incidents" ON incidents;
DROP POLICY IF EXISTS "Allow public read on settings" ON settings;
DROP POLICY IF EXISTS "Allow authenticated insert on sensor_data" ON sensor_data;
DROP POLICY IF EXISTS "Allow authenticated insert on incidents" ON incidents;
DROP POLICY IF EXISTS "Allow authenticated update on settings" ON settings;

-- Public read access (voor demo/prototype)
CREATE POLICY "Allow public read on racks" 
ON racks FOR SELECT 
USING (true);

CREATE POLICY "Allow public read on sensor_data" 
ON sensor_data FOR SELECT 
USING (true);

CREATE POLICY "Allow public read on devices" 
ON devices FOR SELECT 
USING (true);

CREATE POLICY "Allow public read on incidents" 
ON incidents FOR SELECT 
USING (true);

CREATE POLICY "Allow public read on settings" 
ON settings FOR SELECT 
USING (true);

-- Write access voor authenticated users
CREATE POLICY "Allow authenticated insert on sensor_data" 
ON sensor_data FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated insert on incidents" 
ON incidents FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated update on settings" 
ON settings FOR UPDATE 
TO authenticated 
USING (true);

-- ============================================
-- 6. SEED DATA
-- ============================================

-- Insert racks (gebruik ON CONFLICT om dubbele inserts te voorkomen)
INSERT INTO racks (id, name, location) VALUES
  (1, 'Rack A', 'Noordzijde'),
  (2, 'Rack B', 'Centrale rij'),
  (3, 'Rack C', 'Zuidzijde')
ON CONFLICT (name) DO NOTHING;

-- Reset sequence als racks al bestonden
SELECT setval('racks_id_seq', (SELECT MAX(id) FROM racks));

-- Insert default settings voor alle racks
INSERT INTO settings (rack_id, temp_warning_threshold, temp_critical_threshold)
SELECT id, 28.0, 35.0 
FROM racks
ON CONFLICT (rack_id) DO NOTHING;

-- Insert devices
INSERT INTO devices (rack_id, name, status) VALUES
  (1, 'Dell PowerEdge R740', 'online'),
  (1, 'HP ProLiant DL380 Gen10', 'online'),
  (1, 'Cisco Catalyst 9300', 'online'),
  (1, 'NetApp FAS2750', 'online'),
  (2, 'Dell PowerEdge R640', 'online'),
  (2, 'Juniper EX4300', 'online'),
  (2, 'Pure Storage FlashArray', 'online'),
  (2, 'APC Smart-UPS 3000', 'online'),
  (3, 'HPE Apollo 6500 Gen10', 'online'),
  (3, 'Arista 7050X3', 'online'),
  (3, 'EMC VNX5400', 'online'),
  (3, 'Eaton 9PX UPS', 'online'),
  (3, 'Dell PowerVault MD3400', 'online')
ON CONFLICT DO NOTHING;

-- Insert historische sensor data (laatste 30 minuten)
-- Dit genereert 60 metingen per rack (om de 30 seconden)
INSERT INTO sensor_data (rack_id, temperature, humidity, timestamp)
SELECT 
  rack_id,
  CASE 
    WHEN rack_id = 1 THEN 24.0 + (random() * 4)
    WHEN rack_id = 2 THEN 28.0 + (random() * 4)
    ELSE 25.0 + (random() * 4)
  END as temperature,
  45.0 + (random() * 10) as humidity,
  NOW() - (interval '30 seconds' * series)
FROM (SELECT id as rack_id FROM racks) r
CROSS JOIN generate_series(60, 1, -1) as series
ON CONFLICT DO NOTHING;

-- Insert sample incidents
INSERT INTO incidents (type, message, timestamp) VALUES
  ('motion', 'Beweging gedetecteerd in serverruimte', NOW() - interval '5 minutes'),
  ('alarm', 'Temperatuur alarm - Rack B', NOW() - interval '2 hours'),
  ('resolved', 'Temperatuur genormaliseerd', NOW() - interval '1 hour')
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. VERIFICATIE QUERIES
-- ============================================

-- Test query: Check of alle tabellen data bevatten
SELECT 
  'racks' as table_name, COUNT(*) as row_count FROM racks
UNION ALL
SELECT 'sensor_data', COUNT(*) FROM sensor_data
UNION ALL
SELECT 'devices', COUNT(*) FROM devices
UNION ALL
SELECT 'incidents', COUNT(*) FROM incidents
UNION ALL
SELECT 'settings', COUNT(*) FROM settings;

-- Test query: Check rack overview view
SELECT * FROM rack_overview;

-- ============================================
-- SUCCESS!
-- ============================================
-- Als je dit ziet zonder errors, is je database klaar!
-- 
-- Volgende stappen:
-- 1. Ga naar Database > Replication
-- 2. Schakel replication in voor: sensor_data, incidents, devices
-- 3. Kopieer je Project URL en anon key naar .env file
-- 4. Start frontend: npm run dev
-- ============================================
