-- ============================================
-- USER SETTINGS TABLE
-- ============================================
-- Opslag van gebruikersinstellingen voor het IoT Dashboard
-- Ondersteunt temperatuur drempels en audio voorkeuren
-- ============================================

-- Drop existing table if needed (CAREFUL IN PRODUCTION!)
-- DROP TABLE IF EXISTS user_settings CASCADE;

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id INTEGER PRIMARY KEY DEFAULT 1, -- Single user voor nu (kan later auth user_id worden)
  
  -- Temperatuur drempelwaarden
  warn_temp DECIMAL(4,1) NOT NULL DEFAULT 28.0,
  critical_temp DECIMAL(4,1) NOT NULL DEFAULT 35.0,
  
  -- Audio instellingen
  audio_enabled BOOLEAN NOT NULL DEFAULT true,
  alarm_volume INTEGER NOT NULL DEFAULT 15 CHECK (alarm_volume >= 0 AND alarm_volume <= 100),
  notification_enabled BOOLEAN NOT NULL DEFAULT true,
  notification_volume INTEGER NOT NULL DEFAULT 10 CHECK (notification_volume >= 0 AND notification_volume <= 100),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_temp_thresholds CHECK (critical_temp > warn_temp)
);

-- Create index on id (optimization for single-row table)
CREATE INDEX IF NOT EXISTS idx_user_settings_id ON user_settings(id);

-- Insert default settings (if not exists)
INSERT INTO user_settings (id, warn_temp, critical_temp, audio_enabled, alarm_volume, notification_enabled, notification_volume)
VALUES (1, 28.0, 35.0, true, 15, true, 10)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS) - Optional voor nu
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations voor nu (later met auth restricten)
CREATE POLICY "Allow all operations on user_settings"
  ON user_settings
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE user_settings IS 'Gebruikersinstellingen voor IoT Dashboard - temperatuur drempels en audio voorkeuren';
COMMENT ON COLUMN user_settings.id IS 'User ID (1 voor single user, later auth user_id)';
COMMENT ON COLUMN user_settings.warn_temp IS 'Waarschuwingstemperatuur in Celsius';
COMMENT ON COLUMN user_settings.critical_temp IS 'Kritieke temperatuur in Celsius';
COMMENT ON COLUMN user_settings.audio_enabled IS 'Audio alerts aan/uit voor kritieke temperatuur';
COMMENT ON COLUMN user_settings.alarm_volume IS 'Volume percentage voor alarm (0-100)';
COMMENT ON COLUMN user_settings.notification_enabled IS 'Notificatie geluiden aan/uit voor bewegingsdetectie';
COMMENT ON COLUMN user_settings.notification_volume IS 'Volume percentage voor notificaties (0-100)';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$ 
BEGIN 
  RAISE NOTICE '✅ user_settings table succesvol aangemaakt!';
  RAISE NOTICE '📊 Default instellingen ingevoegd (id=1)';
  RAISE NOTICE '🔒 Row Level Security enabled';
  RAISE NOTICE '';
  RAISE NOTICE 'Je kunt nu instellingen opslaan vanuit de app! 🎉';
END $$;
