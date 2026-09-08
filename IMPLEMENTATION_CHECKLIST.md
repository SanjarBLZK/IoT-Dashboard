# ✅ Supabase Implementatie Checklist

Stap-voor-stap checklist om van simulatie naar echte Supabase backend te gaan.

## 📋 Pre-Requirements

- [ ] Supabase account aangemaakt op [supabase.com](https://supabase.com)
- [ ] Nieuw project gecreëerd: "iot-dashboard"
- [ ] Project URL en anon key opgeslagen

---

## 1️⃣ Database Setup (15 min)

### In Supabase Dashboard:

- [ ] Ga naar **SQL Editor**
- [ ] Kopieer SQL uit `SUPABASE_SETUP.md` sectie "Database Schema"
- [ ] Run het schema script (tabellen + indexes + views)
- [ ] Run het seed data script (3 racks + devices + test data)
- [ ] Verifieer in **Table Editor** dat data zichtbaar is

**Verwachte tabellen:**
- ✅ racks (3 rows)
- ✅ sensor_data (180+ rows)
- ✅ devices (13 rows)
- ✅ incidents (1+ rows)
- ✅ settings (3 rows)

---

## 2️⃣ Real-time Configuratie (2 min)

- [ ] Ga naar **Database > Replication**
- [ ] Schakel replication in voor:
  - ✅ `sensor_data`
  - ✅ `incidents`
  - ✅ `devices`

---

## 3️⃣ Environment Setup (5 min)

### In je project folder:

```bash
# 1. Maak .env file aan
touch .env

# 2. Voeg credentials toe (zie Supabase dashboard > Settings > API)
```

**Inhoud van `.env`:**
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

- [ ] `.env` file aangemaakt in project root
- [ ] URL en key ingevuld
- [ ] `.env` staat in `.gitignore`

---

## 4️⃣ Dependencies Installeren (2 min)

```bash
npm install @supabase/supabase-js
```

- [ ] Supabase client geïnstalleerd
- [ ] `package.json` bevat `@supabase/supabase-js`

---

## 5️⃣ Code Files Aanmaken

### File 1: Supabase Client

**📁 src/lib/supabaseClient.ts**

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials in .env file')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] File aangemaakt
- [ ] Import werkt zonder errors

### File 2: API Service

**📁 src/services/supabaseApi.ts**

```typescript
import { supabase } from '../lib/supabaseClient'

export const supabaseApi = {
  // Haal alle racks met laatste data op
  async getRacks() {
    const { data, error } = await supabase
      .from('rack_overview')
      .select('*')
    if (error) throw error
    return data
  },

  // Haal sensor geschiedenis op
  async getSensorHistory(rackId: number, limit = 60) {
    const { data, error } = await supabase
      .from('sensor_data')
      .select('*')
      .eq('rack_id', rackId)
      .order('timestamp', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data?.reverse() || []
  },

  // Haal devices op voor een rack
  async getDevices(rackId: number) {
    const { data, error } = await supabase
      .from('devices')
      .select('name')
      .eq('rack_id', rackId)
    if (error) throw error
    return data?.map(d => d.name) || []
  },

  // Haal recente incidents op
  async getIncidents(limit = 20) {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data || []
  },

  // Subscribe to sensor data changes
  subscribeSensorData(rackId: number, callback: (data: any) => void) {
    return supabase
      .channel(`sensor_${rackId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sensor_data',
          filter: `rack_id=eq.${rackId}`,
        },
        callback
      )
      .subscribe()
  },

  // Subscribe to incidents
  subscribeIncidents(callback: (data: any) => void) {
    return supabase
      .channel('incidents')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'incidents',
        },
        callback
      )
      .subscribe()
  },
}
```

- [ ] File aangemaakt
- [ ] TypeScript errors opgelost

### File 3: Custom Hook voor Data Fetching

**📁 src/hooks/useSupabaseData.ts**

```typescript
import { useState, useEffect } from 'react'
import { supabaseApi } from '../services/supabaseApi'
import { Rack, Incident } from '../types'

export function useSupabaseData() {
  const [racks, setRacks] = useState<Rack[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        
        // Laad rack overview
        const rackData = await supabaseApi.getRacks()
        
        // Voor elke rack: laad geschiedenis en devices
        const racksWithDetails = await Promise.all(
          rackData.map(async (rack) => {
            const history = await supabaseApi.getSensorHistory(rack.id)
            const devices = await supabaseApi.getDevices(rack.id)
            
            return {
              id: rack.id,
              name: rack.name,
              location: rack.location,
              temp: rack.temperature,
              humidity: rack.humidity,
              status: rack.status,
              history: history.map(h => ({
                time: new Date(h.timestamp).toLocaleTimeString('nl-NL', {
                  hour: '2-digit',
                  minute: '2-digit'
                }),
                temp: h.temperature,
                humidity: h.humidity,
              })),
              devices,
            }
          })
        )

        setRacks(racksWithDetails)

        // Laad incidents
        const incidentData = await supabaseApi.getIncidents()
        setIncidents(
          incidentData.map(i => ({
            id: i.id,
            time: new Date(i.timestamp).toLocaleString('nl-NL'),
            type: i.type,
            rack: i.rack_id,
            message: i.message,
            photo: i.photo_url,
          }))
        )

        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setLoading(false)
      }
    }

    loadData()

    // Setup real-time subscriptions
    const channels: any[] = []

    // Subscribe to incidents
    const incidentChannel = supabaseApi.subscribeIncidents((payload) => {
      const newIncident = payload.new
      setIncidents(prev => [{
        id: newIncident.id,
        time: new Date(newIncident.timestamp).toLocaleString('nl-NL'),
        type: newIncident.type,
        rack: newIncident.rack_id,
        message: newIncident.message,
        photo: newIncident.photo_url,
      }, ...prev.slice(0, 19)])
    })
    channels.push(incidentChannel)

    // Subscribe to sensor data for each rack
    rackData.forEach(rack => {
      const channel = supabaseApi.subscribeSensorData(rack.id, (payload) => {
        const newReading = payload.new
        setRacks(prev => prev.map(r => {
          if (r.id !== rack.id) return r
          
          const newHistory = [...r.history.slice(-59), {
            time: new Date(newReading.timestamp).toLocaleTimeString('nl-NL', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            temp: newReading.temperature,
            humidity: newReading.humidity,
          }]

          return {
            ...r,
            temp: newReading.temperature,
            humidity: newReading.humidity,
            history: newHistory,
          }
        }))
      })
      channels.push(channel)
    })

    // Cleanup
    return () => {
      channels.forEach(channel => supabase.removeChannel(channel))
    }
  }, [])

  return { racks, incidents, loading, error }
}
```

- [ ] File aangemaakt
- [ ] Hook getest

---

## 6️⃣ App.tsx Refactoren

### Vervang simulatie door Supabase:

**Oude code (simulatie):**
```typescript
const [racks, setRacks] = useState<Rack[]>(createInitialRacks());
```

**Nieuwe code (Supabase):**
```typescript
import { useSupabaseData } from './hooks/useSupabaseData'

function App() {
  const { racks, incidents, loading, error } = useSupabaseData()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    )
  }

  // Rest van je component blijft hetzelfde...
}
```

**Verwijder:**
- [ ] `createInitialRacks()` import
- [ ] Simulatie useEffects (temperatuur updates, bewegingsdetectie)
- [ ] `incidentIdRef`
- [ ] Alle simulatie logic

**Behoud:**
- [ ] UI componenten (RackCard, RackDetail, etc.)
- [ ] Audio alerts
- [ ] Critical status checking
- [ ] Modal logic

---

## 7️⃣ Testing (10 min)

### Test 1: Data Laden
```bash
npm run dev
```

- [ ] Dashboard laadt zonder errors
- [ ] 3 racks worden getoond
- [ ] Temperaturen komen uit database
- [ ] Charts tonen historische data

### Test 2: Real-time Updates

**In Supabase SQL Editor:**
```sql
INSERT INTO sensor_data (rack_id, temperature, humidity)
VALUES (1, 38.5, 52.0);
```

- [ ] Dashboard update ZONDER page refresh
- [ ] Nieuwe data verschijnt in chart
- [ ] Audio alarm speelt af (temp > 35°C)

### Test 3: Incident Notificaties

```sql
INSERT INTO incidents (type, message)
VALUES ('motion', 'Test bewegingsdetectie');
```

- [ ] Incident verschijnt in lijst
- [ ] Notification sound speelt

---

## 8️⃣ Productie Checklist

### Security

- [ ] `.env` NIET in git repository
- [ ] Alleen `anon` key in frontend (NOOIT `service_role`)
- [ ] RLS policies ingeschakeld op alle tabellen
- [ ] Authenticatie geïmplementeerd (voor write access)

### Performance

- [ ] Indexes aangemaakt op veel-gebruikte queries
- [ ] Sensor data older dan 7 dagen automatisch verwijderen (cronjob)
- [ ] Connection pooling geconfigureerd

### Monitoring

- [ ] Supabase dashboard regelmatig checken
- [ ] Database size monitoren (500MB limit op free tier)
- [ ] API requests tellen

---

## 🎯 Verwachte Resultaten

Na alle stappen:

✅ Dashboard haalt data uit Supabase  
✅ Real-time updates zonder polling  
✅ Incidents verschijnen live  
✅ Sensor geschiedenis komt uit database  
✅ Geen simulatie code meer nodig  
✅ Schaalbaar naar meerdere racks  
✅ Klaar voor IoT device integratie  

---

## 🐛 Common Issues

### "Missing environment variables"
→ Restart dev server: `Ctrl+C` dan `npm run dev`

### "Failed to fetch"
→ Check Supabase URL en API key in `.env`

### "Row Level Security violation"
→ Check RLS policies in Supabase dashboard

### Real-time niet werkend
→ Verify replication is enabled voor tabellen

---

## 📞 Support

Stuck? Check:
1. `SUPABASE_SETUP.md` voor gedetailleerde uitleg
2. Supabase docs: https://supabase.com/docs
3. Browser console voor errors
4. Supabase dashboard > Logs

---

**🎉 Success!** Als alle checkboxes ✅ zijn, draait je dashboard op Supabase!
