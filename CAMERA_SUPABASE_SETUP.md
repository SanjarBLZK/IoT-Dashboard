# 📷 Camera Detecties Opslaan in Supabase

## Overzicht

De camera bewegingsdetectie kan nu automatisch worden opgeslagen in een Supabase database. Hierdoor blijven alle detecties bewaard, zelfs na het herladen van de pagina.

## ✨ Wat Is Geïmplementeerd

### Automatische Database Opslag:
✅ **Camera bewegingsdetectie** → Automatisch opgeslagen in Supabase  
✅ **Temperatuur alarms** → Automatisch opgeslagen in Supabase  
✅ **Foto URLs** → Opgeslagen bij bewegingsdetectie incidents  
✅ **Real-time sync** → Nieuwe incidents van andere bronnen worden live getoond  
✅ **Incident geschiedenis** → Laden van bestaande incidents bij opstarten  
✅ **Fallback mode** → Werkt ook zonder Supabase (alleen lokaal)  

## 🚀 Setup (15 minuten)

### Stap 1: Supabase Account & Project

1. **Ga naar** https://supabase.com
2. **Maak een account** (gratis tier is voldoende)
3. **Maak een nieuw project**:
   - Naam: `iot-dashboard`
   - Database Password: Kies een sterk wachtwoord (bewaar dit!)
   - Region: Kies dichtbij jouw locatie (bijv. West EU - Frankfurt)
   - Pricing: Free tier

**⏱️ Wacht 2-3 minuten** tot het project klaar is.

### Stap 2: Database Schema Installeren

1. **Open SQL Editor** in Supabase dashboard (links in menu)
2. **Klik** "New query"
3. **Kopieer de inhoud** van `supabase_schema.sql` uit dit project
4. **Plak** in de SQL editor
5. **Run** de query (groene play knop)

Dit maakt alle benodigde tabellen:
- ✅ `racks` - Server rack informatie
- ✅ `incidents` - Camera detecties & alarms ⭐
- ✅ `sensor_data` - Temperatuur/humidity geschiedenis
- ✅ `devices` - Apparaten per rack
- ✅ `settings` - Configuratie

### Stap 3: API Credentials Kopiëren

1. **Ga naar** Settings > API (in Supabase dashboard)
2. **Kopieer**:
   - `Project URL` (bijv. https://abcdefgh.supabase.co)
   - `anon public` key (lange string die begint met eyJhbGc...)

⚠️ **Let op**: Gebruik ALLEEN de `anon public` key, NIET de `service_role` key!

### Stap 4: Environment Variables Configureren

1. **Kopieer** `.env.example` naar `.env`:
   ```powershell
   copy .env.example .env
   ```

2. **Open** `.env` in een text editor

3. **Vul in**:
   ```env
   VITE_SUPABASE_URL=https://jouw-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.jouw-key-hier
   ```

4. **Sla op**

### Stap 5: Application Herstarten

```powershell
# Stop de dev server (Ctrl+C als deze draait)
# Start opnieuw
npm run dev
```

## ✅ Verificatie

### Test 1: Check Console Output

Open de browser console (F12) en zoek naar:

```
📚 X incidents geladen uit Supabase
```

Als je dit ziet: **Supabase is succesvol verbonden!** ✅

Als je dit ziet:
```
⚠️ Supabase credentials niet gevonden
```
→ Check je `.env` bestand en herstart de server

### Test 2: Wacht op Bewegingsdetectie

1. **Wacht 45-90 seconden** (automatische detectie interval)
2. **Wanneer beweging wordt gedetecteerd**, check console:
   ```
   📷 Camera detectie opgeslagen in Supabase database
   ```

### Test 3: Check Database

1. **Open Supabase Dashboard** > Table Editor
2. **Selecteer** `incidents` tabel
3. **Je zou moeten zien**:
   - Type: `motion`
   - Message: "Beweging gedetecteerd: ..."
   - Photo URL: "/serverroom.jpg"
   - Timestamp: Recente datum/tijd

### Test 4: Reload Test

1. **Herlaad de pagina** (F5)
2. **Check of incidents blijven staan** ✅
3. Ze worden nu geladen uit de database!

## 🎯 Hoe Het Werkt

### Data Flow:

```
┌─────────────────────────────────────────────────────────┐
│  1. Beweging Gedetecteerd (automatisch, 45-90s)        │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│  2. Incident Aangemaakt                                 │
│     - Type: motion                                      │
│     - Message: "Beweging gedetecteerd: Locatie"        │
│     - Photo: "/serverroom.jpg"                         │
│     - Timestamp: Nu                                     │
└────────────────────┬────────────────────────────────────┘
                     ↓
         ┌───────────┴───────────┐
         ↓                       ↓
┌─────────────────┐     ┌──────────────────┐
│ 3a. Lokaal      │     │ 3b. Supabase     │
│     Opslaan     │     │     Opslaan      │
│                 │     │                  │
│ - State update  │     │ - INSERT query   │
│ - UI update     │     │ - Database       │
│ - Audio beep    │     │ - Real-time      │
└─────────────────┘     └──────────────────┘
                              ↓
                    ┌──────────────────┐
                    │ 4. Bevestiging   │
                    │                  │
                    │ Console log:     │
                    │ "✅ Opgeslagen"  │
                    └──────────────────┘
```

### Real-time Updates:

Als je meerdere browser tabs open hebt, of andere apparaten verbonden zijn:

```
Device A: Beweging detectie → Opslaan in Supabase
                                       ↓
Device B: Real-time update ← Supabase notificatie
Device C: Real-time update ← Supabase notificatie
```

## 📊 Database Schema

### `incidents` Tabel Structuur:

```sql
CREATE TABLE incidents (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL,        -- 'motion', 'alarm', 'resolved'
  rack_id INTEGER,                  -- Optioneel: welke rack (voor alarms)
  message TEXT NOT NULL,            -- Beschrijving
  photo_url TEXT,                   -- Camera foto URL (voor motion)
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT incidents_rack_fk 
    FOREIGN KEY (rack_id) REFERENCES racks(id)
);
```

### Voorbeeld Data:

| id | type   | rack_id | message                                    | photo_url         | timestamp           |
|----|--------|---------|-------------------------------------------|-------------------|---------------------|
| 1  | motion | NULL    | Beweging gedetecteerd: Noordzijde...      | /serverroom.jpg   | 2026-09-16 14:32:15 |
| 2  | alarm  | 2       | Kritieke temperatuur gedetecteerd...      | NULL              | 2026-09-16 14:35:42 |
| 3  | motion | NULL    | Beweging gedetecteerd: Centrale rij...    | /serverroom.jpg   | 2026-09-16 14:38:09 |

## 🔧 Troubleshooting

### "Supabase credentials niet gevonden"

**Oplossing:**
1. Check of `.env` bestand bestaat (niet `.env.example`)
2. Check of variabelen correct zijn ingevuld
3. Herstart dev server: Stop (Ctrl+C) en `npm run dev`
4. Hard refresh browser: Ctrl+F5

### Console Error: "Failed to insert"

**Mogelijke oorzaken:**
1. **Database schema niet gerun** → Run `supabase_schema.sql` in SQL Editor
2. **Verkeerde credentials** → Check API keys in Supabase dashboard
3. **Row Level Security** → Controleer RLS policies in Supabase

**Fix voor RLS (als nodig):**
```sql
-- In Supabase SQL Editor
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Allow public insert (voor prototype)
CREATE POLICY "Allow public inserts" ON incidents
  FOR INSERT TO anon
  USING (true);

-- Allow public select (voor prototype)
CREATE POLICY "Allow public selects" ON incidents
  FOR SELECT TO anon
  USING (true);
```

### Incidents worden niet getoond na reload

**Check:**
1. Open Supabase > Table Editor > `incidents`
2. Zijn er rijen in de tabel?
3. Check browser console voor errors
4. Check of timestamps correct zijn (timezone)

### Real-time werkt niet

1. **Ga naar** Supabase > Database > Replication
2. **Schakel in** voor `incidents` tabel
3. **Refresh** de pagina

## 🎉 Wat Nu?

### Je Hebt Nu:
✅ Camera detecties permanent opgeslagen  
✅ Incident geschiedenis beschikbaar  
✅ Real-time synchronisatie  
✅ Database backup automatisch  
✅ Schaalbaar systeem  

### Volgende Stappen (Optioneel):

1. **Foto Upload naar Supabase Storage**
   - Upload echte camera foto's
   - Genereer publieke URLs
   - Bewaar URLs in database

2. **Authenticatie Toevoegen**
   - Login systeem
   - User permissions
   - Admin dashboard

3. **Sensor Data Integratie**
   - Echte temperatuur sensoren
   - Real-time data updates
   - Historische grafieken uit database

4. **Email Notificaties**
   - Bij kritieke events
   - Dagelijkse reports
   - Supabase Edge Functions

## 📚 Meer Informatie

- **Supabase Docs**: https://supabase.com/docs
- **Project Setup**: `SUPABASE_SETUP.md`
- **Implementation Checklist**: `IMPLEMENTATION_CHECKLIST.md`
- **Camera Feature**: `CAMERA_FEATURE.md`

## 🆘 Support

Als je vastloopt:
1. Check browser console (F12) voor errors
2. Check Supabase dashboard > Logs
3. Check `.env` bestand configuratie
4. Run database schema opnieuw

---

**Status**: ✅ Camera detectie Supabase integratie compleet!

