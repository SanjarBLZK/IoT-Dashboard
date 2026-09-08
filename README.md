# IoT Dashboard - Server Room Monitoring System

Een real-time monitoring dashboard voor serverruimte temperatuur, luchtvochtigheid en beveiligingsincidenten.

![Dashboard Preview](https://img.shields.io/badge/Status-Ready-success)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

## 🚀 Features

### ✅ Geïmplementeerd (Prototype)
- **Real-time Monitoring**: Temperatuur en luchtvochtigheid per server rack
- **Visuele Indicatoren**: 
  - Status dots (OK/Waarschuwing/Kritiek) met glow effecten
  - Circulaire temperatuur gauges (270° SVG arc)
  - Progress bars voor luchtvochtigheid
- **Interactieve Grafieken**:
  - Mini sparkline charts per rack (laatste 15 metingen)
  - Uitgebreide detailgrafieken met 30 minuten geschiedenis
  - Vergelijkingsgrafiek voor alle racks met drempelwaarden
- **Alert Systeem**:
  - Kritieke temperatuur waarschuwingen met audio alarm
  - Visuele banner met dismiss functie
  - Browser-based audio (Web Audio API)
- **Incident Logging**:
  - Bewegingsdetectie met foto preview
  - Temperatuur alarm registratie
  - Tijdstempel per incident
- **Modal Details**: 
  - Volledige rack informatie
  - Temperature/humidity trends
  - Device lijst per rack
  - ESC/click-outside sluiten

### 🔄 Data Simulatie (Prototype)
- Temperatuur updates elke 5 seconden (configureerbaar naar 1 minuut)
- Random drift simulatie (-0.4°C tot +0.4°C)
- Bewegingsdetectie elke 45-90 seconden
- 60 historische datapunten (30 minuten bij 30sec interval)

### 📋 Nog Toe Te Voegen (Backend Integratie)
- [ ] **Authenticatie**: JWT-based login systeem
- [ ] **API Integratie**: RESTful backend connectie
- [ ] **WebSockets**: Real-time incident push notificaties
- [ ] **Geluidssensoren**: dB niveau monitoring
- [ ] **Instellingen Pagina**: Configureerbare drempelwaarden
- [ ] **Database**: PostgreSQL met sensor_data & incidents tabellen
- [ ] **Python Backend**: Flask API + Camera bewegingsdetectie

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 met TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **Charts**: Recharts 2.10
- **Audio**: Web Audio API
- **Icons**: Emoji (🚨📷✅) + SVG

## 📦 Installatie

```powershell
# 1. Clone repository
cd c:\Users\sanja\OneDrive\Documenten\IoT-Dashboard

# 2. Installeer dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser
# Browser opent automatisch op http://localhost:3000
```

## 🎯 Gebruik

### Development
```powershell
npm run dev          # Start development server (port 3000)
npm run build        # Build voor productie
npm run preview      # Preview productie build
npm run lint         # ESLint code checking
```

### Project Structuur
```
IoT-Dashboard/
├── src/
│   ├── components/          # React componenten
│   │   ├── StatusDot.tsx    # Status indicator dot
│   │   ├── StatusBadge.tsx  # Status label badge
│   │   ├── TempArc.tsx      # Temperatuur gauge (SVG)
│   │   ├── RackCard.tsx     # Rack overview kaart
│   │   ├── RackDetail.tsx   # Detail modal
│   │   └── IncidentList.tsx # Incident log
│   ├── utils/               # Utilities
│   │   ├── simulation.ts    # Data simulatie helpers
│   │   └── audio.ts         # Audio alert systeem
│   ├── types.ts             # TypeScript interfaces
│   ├── App.tsx              # Main component
│   ├── main.tsx             # React entry point
│   └── index.css            # Global styles + Tailwind
├── public/                  # Static assets
├── index.html               # HTML template
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── tailwind.config.js       # Tailwind config
└── vite.config.ts           # Vite config
```

## 🎨 UI Features

### Status Indicatoren
- **Groen** (OK): Temperatuur < 28°C
- **Oranje** (Waarschuwing): 28°C ≤ Temp < 35°C  
- **Rood** (Kritiek): Temperatuur ≥ 35°C

### Audio Alerts
- **Kritiek Alarm**: 3x beep @ 880Hz (square wave)
- **Beweging**: Enkele beep @ 1200Hz (sine wave)

### Responsiveness
- Mobile-first design
- Grid layout (1/2/3 kolommen)
- Touch-friendly buttons en controls

## 🔧 Configuratie

### Polling Interval Aanpassen
In `src/App.tsx` regel 28:
```typescript
const interval = setInterval(() => {
  // ...
}, 5000); // Wijzig naar 60000 voor 1 minuut
```

### Drempelwaarden Aanpassen
In `src/utils/simulation.ts`:
```typescript
export function deriveStatus(temp: number): RackStatus {
  if (temp >= 35) return "critical";  // Wijzig drempel
  if (temp >= 28) return "warn";      // Wijzig drempel
  return "ok";
}
```

## 📊 Data Flow

```
Simulatie (5sec) → Update State → Render UI
                          ↓
                  Check Critical → Audio Alert
                          ↓
                   Update History (Rolling Window)
```

## 🔐 Toekomstige Backend Integratie

### API Endpoints (To Do)
```
POST   /api/auth/login          # Authenticatie
GET    /api/sensors             # Sensor data ophalen
GET    /api/incidents           # Incident log
PUT    /api/settings/:rackId    # Drempelwaarden update
WS     ws://host/incidents      # WebSocket voor real-time
```

### Database Schema (To Do)
```sql
-- sensor_data tabel
CREATE TABLE sensor_data (
  id SERIAL PRIMARY KEY,
  rack_id INT NOT NULL,
  temperature DECIMAL(5,2),
  humidity DECIMAL(5,2),
  sound_level DECIMAL(5,2),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- incidents tabel
CREATE TABLE incidents (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20),
  rack_id INT,
  message TEXT,
  photo_url TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

## 🐛 Troubleshooting

### Audio werkt niet
- Controleer browser audio permissions
- Sommige browsers blokkeren autoplay audio
- Klik eerst ergens op de pagina (user interaction vereist)

### Grafieken laden niet
- Check browser console voor errors
- Controleer of Recharts correct is geïnstalleerd
- Verify dat history data bestaat (min. 2 datapunten)

### Dependencies installeren lukt niet
```powershell
# Clear npm cache
npm cache clean --force

# Verwijder node_modules en lock file
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Herinstalleer
npm install
```

## 📝 Licentie

MIT License - Vrij te gebruiken voor educatieve en commerciële doeleinden.

## 👨‍💻 Ontwikkeling

Dit is een prototype dashboard. Voor productie gebruik:
1. Implementeer echte API connecties
2. Voeg authenticatie toe
3. Deploy backend (Python/Flask)
4. Setup PostgreSQL database
5. Configureer camera's voor bewegingsdetectie
6. Test met echte sensoren (DHT22 of DS18B20)

---

**Status**: ✅ Prototype klaar voor testing en backend integratie


---

## 🎉 SUPABASE BACKEND - COMPLETE MEMORYBANK

**✅ Volledige Supabase integratie documentatie toegevoegd!**

In plaats van PostgreSQL + Docker setup, gebruik **Supabase** (managed PostgreSQL met real-time):

### 📚 Documentatie Files:

1. **`SUPABASE_SETUP.md`** ⭐ START HIER
   - Complete setup handleiding (15 min lezen)
   - Database schema uitleg
   - Frontend integratie code
   - Authenticatie systeem
   - Real-time subscriptions

2. **`IMPLEMENTATION_CHECKLIST.md`** 
   - Stap-voor-stap checklist met ✅ checkboxes
   - Copy-paste ready code snippets
   - Testing scenarios
   - Geschatte tijd: ~1 uur

3. **`supabase_schema.sql`**
   - Complete SQL script (copy-paste in Supabase SQL Editor)
   - 5 tabellen + indexes + views + seed data
   - Klaar in 2 minuten

4. **`SUPABASE_FILES_OVERVIEW.md`**
   - Overzicht van alle documentatie
   - Quick start guide (5 min)
   - Database diagram
   - Troubleshooting

5. **`.env.example`**
   - Template voor environment variabelen
   - Kopieer naar `.env` en vul credentials in

### 🚀 Quick Start (30 min):

```bash
# 1. Supabase project aanmaken op supabase.com
# 2. Run SQL script (supabase_schema.sql) in SQL Editor
# 3. Configureer environment
cp .env.example .env
# Vul VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY in

# 4. Installeer Supabase client
npm install @supabase/supabase-js

# 5. Code implementeren (volg IMPLEMENTATION_CHECKLIST.md)
# 6. Test
npm run dev
```

### ✅ Voordelen vs. Zelf-hosted PostgreSQL:

| Feature | Supabase | Zelf-hosted |
|---------|----------|-------------|
| Setup tijd | 30 min | 2+ uur |
| Real-time | ✅ Built-in | ❌ Zelf bouwen |
| Authenticatie | ✅ Included | ❌ Zelf bouwen |
| Backups | ✅ Automatisch | ❌ Zelf regelen |
| Maintenance | ✅ Geen | ❌ Wel |
| Kosten (500MB) | ✅ Gratis | 💰 Server kosten |
| Schaalbaarheid | ✅ Automatisch | ❌ Handmatig |

### 📊 Database Schema (in Supabase):

```
racks (3 rows)
├── sensor_data (180+ readings per rack)
├── devices (4-5 per rack)
├── incidents (motion/alarm events)
└── settings (drempelwaarden per rack)
```

### 🎯 Van Simulatie naar Productie:

**NU (Prototype):**
```typescript
const [racks] = useState(createInitialRacks()) // Simulatie
```

**STRAKS (Supabase):**
```typescript
const { racks } = useSupabaseData() // Echte data + real-time!
```

Alle code voor deze migratie staat in de documentatie files! 🚀

---
