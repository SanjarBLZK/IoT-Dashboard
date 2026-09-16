# IoT Dashboard - Server Room Monitoring System

Een real-time monitoring dashboard voor serverruimte temperatuur, luchtvochtigheid en beveiligingsincidenten.

![Dashboard Preview](https://img.shields.io/badge/Status-Ready-success)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

## 🚀 Features

### ✅ Geïmplementeerd

**Prototype Mode (Zonder Database):**
- Real-time monitoring van temperatuur en luchtvochtigheid
- Camera bewegingsdetectie met foto's
- Lokale incident logging (verdwijnt bij reload)
- Audio alerts en notificaties
- Interactieve grafieken en visualisaties

**Database Mode (Met Supabase):** ⭐ **NIEUW**
- **Camera detecties permanent opgeslagen** 
- **Incident geschiedenis blijft bewaard**
- **Real-time synchronisatie tussen apparaten**
- **Temperatuur alarms opgeslagen in database**
- **Foto URLs bewaard bij bewegingsdetectie**
- Automatische backup en schaalbaarheid

> 📖 **Setup**: Zie `CAMERA_SUPABASE_SETUP.md` voor 15-minuten Supabase integratie

### ✅ Geïmplementeerd (Prototype)
- **Real-time Monitoring**: Temperatuur en luchtvochtigheid per server rack
- **Visuele / Bewegingsdetectie (Camera)**:
  - 📷 Live camera feed van serverruimte
  - Automatische fotoregistratie bij bewegingsdetectie
  - **Foto's worden opgeslagen in Supabase database** ⭐
  - Camera hoeft niet per se een high-end professionele camera te zijn
  - Visuele feedback bij bewegingsdetectie (rood overlay + alarm)
  - **Incident geschiedenis blijft bewaard** ⭐
- **Visuele Indicatoren**: 
  - Status dots (OK/Waarschuwing/Kritiek) met glow effecten
  - Circulaire temperatuur gauges (270° SVG arc)
  - Progress bars voor luchtvochtigheid
- **Interactieve Grafieken**: 
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
  - Bewegingsdetectie met automatische foto opslag
  - **Incidents worden opgeslagen in Supabase database** ⭐
  - **Real-time synchronisatie tussen apparaten** ⭐
  - Foto preview met klik-om-te-vergroten functionaliteit
  - Temperatuur alarm registratie
  - Tijdstempel per incident
  - Locatie informatie (Noordzijde, Centrale rij, etc.)
  - **Incident geschiedenis blijft bewaard na reload** ⭐
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

### Quick Start (Lokaal, Zonder Database)

```powershell
# 1. Clone repository
cd c:\Users\gorya\IoT-Dashboard-1

# 2. Installeer dependencies
npm install

# 3. Voeg je serverruimte foto toe
# Plaats serverroom.jpg in de public/ folder
# De foto die je hebt geüpload moet hier komen:
# c:\Users\gorya\IoT-Dashboard-1\public\serverroom.jpg

# 4. Start development server
npm run dev

# 5. Open browser
# Browser opent automatisch op http://localhost:5173
```

> ⚠️ **Let op**: Zonder database verdwijnen incidents bij reload

### Met Database (Aanbevolen voor Productie)

Voor permanente opslag van camera detecties:

```powershell
# 1-3. Volg stappen hierboven eerst

# 4. Setup Supabase (15 minuten)
# Zie: CAMERA_SUPABASE_SETUP.md voor gedetailleerde instructies

# Kort:
# - Maak Supabase account op https://supabase.com
# - Run supabase_schema.sql in SQL Editor
# - Kopieer .env.example naar .env
# - Vul VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY in
# - Herstart: npm run dev

# 5. Verificatie
# Check console voor: "📚 X incidents geladen uit Supabase"
```

📖 **Gedetailleerde instructies**: `CAMERA_SUPABASE_SETUP.md`

### 📸 Serverruimte Foto Setup

**Belangrijk**: De camera functionaliteit gebruikt jouw eigen serverruimte foto.

1. Sla de foto op als: `serverroom.jpg`
2. Plaats het in: `public/serverroom.jpg`
3. De foto wordt automatisch gebruikt voor:
   - Camera live feed
   - Bewegingsdetectie incident foto's

**Optioneel**: Voor variatie in incident foto's, voeg meerdere foto's toe:
- `public/serverroom.jpg` (verplicht)
- `public/serverroom-2.jpg` (optioneel)
- `public/serverroom-3.jpg` (optioneel)
- `public/serverroom-4.jpg` (optioneel)

Als je meerdere foto's toevoegt, update dan `src/utils/simulation.ts` om deze te gebruiken.

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
│   │   ├── CameraView.tsx   # Camera feed met bewegingsdetectie
│   │   └── IncidentList.tsx # Incident log met foto's
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

### Camera Monitoring
- **Live Feed**: Real-time beeld van serverruimte
- **Bewegingsdetectie**: Automatisch triggeren bij beweging
- **Foto Opslag**: Elke beweging wordt gefotografeerd en opgeslagen
- **Camera Info**: CAM-01 identificatie met timestamp overlay
- **Status Monitoring**: Actief/Offline indicator met resolutie info

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
ALS de changes niet werken:

1 Stop de container: docker-compose down
2 Rebuild met nieuwe code: docker-compose up -d --build
