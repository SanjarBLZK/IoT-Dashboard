-- ============================================
-- IOT DASHBOARD - MARIADB SCHEMA
-- ============================================
-- Wordt bij elke start van de API uitgevoerd. Alles is idempotent, dus
-- herhaald draaien is veilig en verandert bestaande data niet.
--
-- Vier tabellen: users, settings, sensor_data, incidents.
--
-- Let op bij DATETIME: de API zet elke verbinding op UTC (time_zone '+00:00')
-- en de mysql2 driver leest DATETIME ook als UTC. Daardoor kloppen de
-- tijdstempels ongeacht de tijdzone van de server of de browser.
-- ============================================


-- ============================================
-- users
--   Accounts om in te loggen. Geen rollen: elk account is gelijk.
--   password_hash bevat een bcrypt hash, gemaakt door de API.
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username      VARCHAR(64)  NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login    DATETIME     NULL DEFAULT NULL,

  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- settings
--   Drempelwaarden per rack. Deze zijn GEDEELD: er is precies een rij per
--   rack, niet een rij per gebruiker. Wijzigt iemand een waarde, dan zien
--   alle apparaten dezelfde nieuwe waarde.
--
--   updated_at wordt door MariaDB zelf bijgehouden via
--   ON UPDATE CURRENT_TIMESTAMP, dus daar is geen trigger voor nodig.
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  id                  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  rack_id             INT    NOT NULL,
  temp_threshold_high DOUBLE NOT NULL DEFAULT 35.0,
  temp_threshold_low  DOUBLE NOT NULL DEFAULT 15.0,
  humidity_threshold  DOUBLE NOT NULL DEFAULT 60.0,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                      ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_settings_rack (rack_id),
  CONSTRAINT chk_temp_range CHECK (temp_threshold_high > temp_threshold_low)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- sensor_data
--   Alle sensormetingen. Er blijven maximaal 500 records bewaard.
--
--   WAAROM GEEN TRIGGER:
--   In PostgreSQL kon een trigger op deze tabel de oudste rijen verwijderen.
--   MariaDB staat dat niet toe: een trigger mag de tabel waarop hij staat
--   niet zelf muteren (fout 1442, "Can't update table ... in stored
--   function/trigger"). De opruiming gebeurt daarom in de API, direct na
--   elke insert. Zie db.js -> enforceSensorLimit().
--
--   Elke schrijfweg loopt via de API (de simulator en POST /api/sensors),
--   dus de limiet wordt altijd toegepast.
-- ============================================
CREATE TABLE IF NOT EXISTS sensor_data (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  rack_id     INT      NOT NULL,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  temperature DOUBLE   NOT NULL,
  humidity    DOUBLE   NOT NULL,

  PRIMARY KEY (id),
  KEY idx_sensor_rack_ts (rack_id, `timestamp`),
  KEY idx_sensor_ts (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- incidents
--   Gebeurtenissen: beweging, geluid of temperatuur.
-- ============================================
CREATE TABLE IF NOT EXISTS incidents (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `timestamp` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  type        VARCHAR(32)  NOT NULL,
  image_path  VARCHAR(512) NULL DEFAULT NULL,
  description TEXT         NOT NULL,

  PRIMARY KEY (id),
  KEY idx_incidents_ts (`timestamp`),
  KEY idx_incidents_type (type),
  CONSTRAINT chk_incident_type
    CHECK (type IN ('beweging', 'geluid', 'temperatuur'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- Standaard drempelwaarden voor rack 1, 2 en 3.
-- INSERT IGNORE: bestaande, door de gebruiker aangepaste waarden blijven staan.
-- ============================================
INSERT IGNORE INTO settings
  (rack_id, temp_threshold_high, temp_threshold_low, humidity_threshold)
VALUES
  (1, 35.0, 15.0, 60.0),
  (2, 35.0, 15.0, 60.0),
  (3, 35.0, 15.0, 60.0);
