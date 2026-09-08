# 🗄️ Supabase Backend Setup - IoT Dashboard

Complete handleiding voor het integreren van Supabase als backend voor het Server Room Monitoring Dashboard.

## 📋 Inhoudsopgave

1. [Waarom Supabase?](#waarom-supabase)
2. [Supabase Project Setup](#supabase-project-setup)
3. [Database Schema](#database-schema)
4. [Environment Variables](#environment-variables)
5. [Frontend Integratie](#frontend-integratie)
6. [Authenticatie](#authenticatie)
7. [Real-time Subscriptions](#real-time-subscriptions)
8. [API Service Laag](#api-service-laag)
9. [Testing](#testing)

---

## 🎯 Waarom Supabase?

Supabase is een open-source Firebase alternatief gebouwd op PostgreSQL met:

✅ **Real-time subscriptions** - Live data updates zonder polling  
✅ **Ingebouwde authenticatie** - JWT-based auth out-of-the-box  
✅ **Row Level Security** - Database-level authorization  
✅ **RESTful API** - Auto-gegenereerde API endpoints  
✅ **TypeScript support** - Volledig type-safe  
✅ **Gratis tier** - 500MB database, 1GB file storage  

**Voordelen vs. zelf-hosted PostgreSQL:**
- Geen server maintenance
- Automatische backups
- Built-in auth systeem
- Real-time zonder extra setup (WebSockets)
- Dashboard UI voor database management

---

## 🚀 Supabase Project Setup

### Stap 1: Maak een Supabase Account

1. Ga naar [supabase.com](https://supabase.com)
2. Klik op "Start your project"
3. Sign up met GitHub of email

### Stap 2: Nieuw Project Aanmaken

```
Project Name: iot-dashboard
Database Password: [kies een sterk wachtwoord]
Region: West EU (Netherlands) - voor laagste latency
Pricing Plan: Free (500MB database)
```

### Stap 3: Project Details Opslaan

Na aanmaken vind je in **Settings > API**:

```
Project URL: https://[jouw-project-id].supabase.co
anon public key: eyJhbGc... (lang token)
service_role key: eyJhbGc... (GEHEIM - alleen server-side)
```

⚠️ **Belangrijk**: Gebruik alleen de `anon public` key in frontend code!

---

## 🗃️ Database Schema

### Stap 1: SQL Editor Openen

Ga naar **SQL Editor** in je Supabase dashboard.

### Stap 2: Maak Tabellen Aan

```sql
-- ============================================
-- IOT DASHBOARD DATABASE SCHEMA
-- ============================================

-- 1. RACKS TABLE
-- Bevat informatie over server racks
CREATE TABLE racks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  location VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. SENSOR_DATA TABLE
-- Bevat alle sensor metingen
CREATE TABLE sensor_data (
  id SERIAL PRIMARY KEY,
  rack_id INTEGER NOT NULL REFERENCES racks(id) ON DELETE CASCADE,
  temperature DECIMAL(5,2) NOT NULL,
  humidity DECIMAL(5,2) NOT NULL,
  sound_level DECIMAL(5,2), -- Optioneel: voor toekomstige geluidssensoren
  timestamp TIMESTAMP DEFAULT NOW()
);

-- 3. DEVICES TABLE
-- Apparaten in elk rack
CREATE TABLE devices (
  id SERIAL PRIMARY KEY,
  rack_id INTEGER NOT NULL REFERENCES racks(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'online',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. INCIDENTS TABLE
-- Bevat bewegingsdetectie en alarm events
CREATE TABLE incidents (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('motion', 'alarm', 'resolved')),
  rack_id INTEGER REFERENCES racks(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  photo_url TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- 5. SETTINGS TABLE
-- Configureerbare drempelwaarden per rack
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  rack_id INTEGER NOT NULL UNIQUE REFERENCES racks(id) ON DELETE CASCADE,
  temp_warning_threshold DECIMAL(5,2) DEFAULT 28.0,
  temp_critical_threshold DECIMAL(5,2) DEFAULT 35.0,
  humidity_max_threshold DECIMAL(5,2) DEFAULT 60.0,
  humidity_min_threshold DECIMAL(5,2) DEFAULT 40.0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES voor betere performance
-- ============================================

-- Index voor snelle sensor data queries (vaak gebruikt)
CREATE INDEX idx_sensor_data_rack_timestamp 
ON sensor_data(rack_id, timestamp DESC);

-- Index voor incident queries
CREATE INDEX idx_incidents_timestamp 
ON incidents(timestamp DESC);

-- Index voor device lookups
CREATE INDEX idx_devices_rack_id 
ON devices(rack_id);

-- ============================================
-- VIEWS voor gemakkelijke queries
-- ============================================

-- View voor laatste sensor reading per rack
CREATE VIEW latest_sensor_readings AS
SELECT DISTINCT ON (rack_id)
  rack_id,
  temperature,
  humidity,
  sound_level,
  timestamp
FROM sensor_data
ORDER BY rack_id, timestamp DESC;

-- View voor rack overzicht met laatste data
CREATE VIEW rack_overview AS
SELECT 
  r.id,
  r.name,
  r.location,
  lsr.temperature,
  lsr.humidity,
  lsr.sound_level,
  lsr.timestamp as last_reading,
  CASE 
    WHEN lsr.temperature >= s.temp_critical_threshold THEN 'critical'
    WHEN lsr.temperature >= s.temp_warning_threshold THEN 'warn'
    ELSE 'ok'
  END as status,
  (SELECT COUNT(*) FROM devices d WHERE d.rack_id = r.id AND d.status = 'online') as active_devices
FROM racks r
LEFT JOIN latest_sensor_readings lsr ON r.id = lsr.rack_id
LEFT JOIN settings s ON r.id = s.rack_id;

-- ============================================
-- FUNCTIONS
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
CREATE TRIGGER update_racks_updated_at 
BEFORE UPDATE ON racks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger voor settings tabel
CREATE TRIGGER update_settings_updated_at 
BEFORE UPDATE ON settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS op alle tabellen
ALTER TABLE racks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Public read access (met anon key)
-- In productie: vervang door user-gebaseerde policies

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

-- Write access alleen voor authenticated users
-- Voeg dit later toe na auth implementatie

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
```

### Stap 3: Seed Data Toevoegen

```sql
-- ============================================
-- SEED DATA voor testing
-- ============================================

-- Insert racks
INSERT INTO racks (name, location) VALUES
  ('Rack A', 'Noordzijde'),
  ('Rack B', 'Centrale rij'),
  ('Rack C', 'Zuidzijde');

-- Insert default settings voor alle racks
INSERT INTO settings (rack_id, temp_warning_threshold, temp_critical_threshold)
SELECT id, 28.0, 35.0 FROM racks;

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
  (3, 'Dell PowerVault MD3400', 'online');

-- Insert initial sensor data (laatste 30 minuten)
-- Dit zou normaal via sensoren komen, maar voor testing:
INSERT INTO sensor_data (rack_id, temperature, humidity, timestamp)
SELECT 
  rack_id,
  24.0 + (random() * 4),  -- Random temp tussen 24-28°C
  45.0 + (random() * 10), -- Random humidity tussen 45-55%
  NOW() - (interval '30 seconds' * generate_series(60, 0, -1))
FROM (SELECT id as rack_id FROM racks) r
CROSS JOIN generate_series(60, 0, -1);

-- Insert sample incident
INSERT INTO incidents (type, message, timestamp) VALUES
  ('motion', 'Beweging gedetecteerd in serverruimte', NOW() - interval '5 minutes');
```

### Stap 4: Realtime Inschakelen

1. Ga naar **Database > Replication**
2. Schakel replication in voor tabellen:
   - `sensor_data` ✅
   - `incidents` ✅
   - `devices` ✅

---

## 🔐 Environment Variables

### Stap 1: Maak .env File

```bash
# In project root folder
touch .env
```

### Stap 2: Voeg Credentials Toe

```env
# .env
VITE_SUPABASE_URL=https://[jouw-project-id].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...jouw-anon-key
```

⚠️ **BELANGRIJK**: 
- Gebruik `VITE_` prefix voor Vite projects
- Voeg `.env` toe aan `.gitignore`
- NOOIT de `service_role` key in frontend gebruiken!

### Stap 3: Update .gitignore

```gitignore
# Environment variables
.env
.env.local
.env.production
.env.development
```

---

## 💻 Frontend Integratie

### Stap 1: Installeer Supabase Client

```bash
npm install @supabase/supabase-js
```

### Stap 2: Maak Supabase Client

**src/lib/supabaseClient.ts**
```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### Stap 3: Type Definities

**src/lib/database.types.ts**
```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      racks: {
        Row: {
          id: number
          name: string
          location: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          location: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          location?: string
          updated_at?: string
        }
      }
      sensor_data: {
        Row: {
          id: number
          rack_id: number
          temperature: number
          humidity: number
          sound_level: number | null
          timestamp: string
        }
        Insert: {
          id?: number
          rack_id: number
          temperature: number
          humidity: number
          sound_level?: number | null
          timestamp?: string
        }
        Update: {
          id?: number
          rack_id?: number
          temperature?: number
          humidity?: number
          sound_level?: number | null
          timestamp?: string
        }
      }
      devices: {
        Row: {
          id: number
          rack_id: number
          name: string
          status: string
          created_at: string
        }
        Insert: {
          id?: number
          rack_id: number
          name: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: number
          rack_id?: number
          name?: string
          status?: string
        }
      }
      incidents: {
        Row: {
          id: number
          type: 'motion' | 'alarm' | 'resolved'
          rack_id: number | null
          message: string
          photo_url: string | null
          timestamp: string
        }
        Insert: {
          id?: number
          type: 'motion' | 'alarm' | 'resolved'
          rack_id?: number | null
          message: string
          photo_url?: string | null
          timestamp?: string
        }
        Update: {
          id?: number
          type?: 'motion' | 'alarm' | 'resolved'
          rack_id?: number | null
          message?: string
          photo_url?: string | null
          timestamp?: string
        }
      }
      settings: {
        Row: {
          id: number
          rack_id: number
          temp_warning_threshold: number
          temp_critical_threshold: number
          humidity_max_threshold: number
          humidity_min_threshold: number
          updated_at: string
        }
        Insert: {
          id?: number
          rack_id: number
          temp_warning_threshold?: number
          temp_critical_threshold?: number
          humidity_max_threshold?: number
          humidity_min_threshold?: number
          updated_at?: string
        }
        Update: {
          id?: number
          rack_id?: number
          temp_warning_threshold?: number
          temp_critical_threshold?: number
          humidity_max_threshold?: number
          humidity_min_threshold?: number
          updated_at?: string
        }
      }
    }
    Views: {
      rack_overview: {
        Row: {
          id: number
          name: string
          location: string
          temperature: number
          humidity: number
          sound_level: number | null
          last_reading: string
          status: 'ok' | 'warn' | 'critical'
          active_devices: number
        }
      }
    }
  }
}
```

---

## 🔑 Authenticatie

### Setup Email Auth in Supabase

1. Ga naar **Authentication > Providers**
2. Schakel "Email" in
3. Configureer email templates (optioneel)

### Login Component

**src/components/Login.tsx**
```typescript
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-100 mb-6">
          IoT Dashboard Login
        </h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Wachtwoord
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100"
              required
            />
          </div>
          {error && (
            <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Inloggen...' : 'Inloggen'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

### Auth Provider in App

```typescript
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import { Session } from '@supabase/supabase-js'
import { Login } from './components/Login'
import App from './App'

export function AuthProvider() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!session) {
    return <Login />
  }

  return <App session={session} />
}
```

---

## 📡 Real-time Subscriptions

### Subscribe to Sensor Data Changes

```typescript
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Database } from '../lib/database.types'

type SensorData = Database['public']['Tables']['sensor_data']['Row']

export function useSensorData(rackId: number) {
  const [data, setData] = useState<SensorData[]>([])

  useEffect(() => {
    // Initial fetch
    const fetchData = async () => {
      const { data } = await supabase
        .from('sensor_data')
        .select('*')
        .eq('rack_id', rackId)
        .order('timestamp', { ascending: false })
        .limit(60)

      if (data) setData(data)
    }

    fetchData()

    // Subscribe to changes
    const channel = supabase
      .channel(`sensor_data_${rackId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sensor_data',
          filter: `rack_id=eq.${rackId}`,
        },
        (payload) => {
          setData((current) => [payload.new as SensorData, ...current.slice(0, 59)])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [rackId])

  return data
}
```

### Subscribe to Incidents

```typescript
export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([])

  useEffect(() => {
    // Initial fetch
    const fetchIncidents = async () => {
      const { data } = await supabase
        .from('incidents')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20)

      if (data) setIncidents(data)
    }

    fetchIncidents()

    // Subscribe to new incidents
    const channel = supabase
      .channel('incidents')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'incidents',
        },
        (payload) => {
          setIncidents((current) => [payload.new as Incident, ...current.slice(0, 19)])
          playNotificationSound() // Speel geluid af
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return incidents
}
```

---

## 🔌 API Service Laag

**src/services/api.ts**
```typescript
import { supabase } from '../lib/supabaseClient'

export const api = {
  // Haal alle racks op met laatste sensor data
  async getRacks() {
    const { data, error } = await supabase
      .from('rack_overview')
      .select('*')
    
    if (error) throw error
    return data
  },

  // Haal sensor historie op voor een rack
  async getSensorHistory(rackId: number, minutes: number = 30) {
    const { data, error } = await supabase
      .from('sensor_data')
      .select('*')
      .eq('rack_id', rackId)
      .gte('timestamp', new Date(Date.now() - minutes * 60 * 1000).toISOString())
      .order('timestamp', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Haal devices op voor een rack
  async getDevices(rackId: number) {
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .eq('rack_id', rackId)
    
    if (error) throw error
    return data
  },

  // Update settings voor een rack
  async updateSettings(rackId: number, settings: {
    temp_warning_threshold?: number
    temp_critical_threshold?: number
    humidity_max_threshold?: number
    humidity_min_threshold?: number
  }) {
    const { data, error } = await supabase
      .from('settings')
      .update(settings)
      .eq('rack_id', rackId)
      .select()
    
    if (error) throw error
    return data
  },

  // Haal incidents op
  async getIncidents(limit: number = 20) {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  },

  // Voeg sensor data toe (voor IoT devices)
  async addSensorReading(rackId: number, temperature: number, humidity: number, soundLevel?: number) {
    const { data, error } = await supabase
      .from('sensor_data')
      .insert({
        rack_id: rackId,
        temperature,
        humidity,
        sound_level: soundLevel,
      })
      .select()
    
    if (error) throw error
    return data
  },

  // Voeg incident toe
  async addIncident(type: 'motion' | 'alarm' | 'resolved', message: string, rackId?: number, photoUrl?: string) {
    const { data, error } = await supabase
      .from('incidents')
      .insert({
        type,
        message,
        rack_id: rackId,
        photo_url: photoUrl,
      })
      .select()
    
    if (error) throw error
    return data
  },
}
```

---

## 🧪 Testing

### Manual Testing via Supabase Dashboard

1. Ga naar **Table Editor**
2. Selecteer `sensor_data` tabel
3. Klik "Insert row"
4. Voeg test data toe:
   ```
   rack_id: 1
   temperature: 36.5
   humidity: 55.0
   ```
5. Check of dashboard live update toont!

### Test Incident Notification

```sql
-- Run in SQL Editor
INSERT INTO incidents (type, message, rack_id)
VALUES ('alarm', 'Test kritieke temperatuur alarm', 1);
```

Dashboard zou direct een notificatie moeten tonen.

---

## 📝 Volgende Stappen

1. ✅ Supabase project aanmaken
2. ✅ Database schema uitvoeren
3. ✅ Environment variables configureren
4. ✅ Supabase client installeren
5. ⏳ Frontend code refactoren
6. ⏳ Authenticatie implementeren
7. ⏳ Real-time subscriptions toevoegen
8. ⏳ Settings pagina bouwen
9. ⏳ IoT devices connecten (Raspberry Pi + sensors)

---

## 🆘 Troubleshooting

### "Missing Supabase environment variables"
- Check of `.env` file bestaat in root folder
- Controleer of variabelen beginnen met `VITE_`
- Restart development server na .env wijzigingen

### "Row Level Security" errors
- Controleer of RLS policies correct zijn ingesteld
- Test met authenticated user als public access niet werkt
- Check policies in Supabase dashboard: **Authentication > Policies**

### Real-time updates werken niet
- Controleer of replication is ingeschakeld voor de tabel
- Check browser console voor WebSocket errors
- Verify dat je gesubscribed bent op de juiste channel

---

## 🔗 Nuttige Links

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [Real-time Guide](https://supabase.com/docs/guides/realtime)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**📅 Document versie**: 1.0  
**🔄 Laatst bijgewerkt**: 2024  
**✍️ Auteur**: IoT Dashboard Team
