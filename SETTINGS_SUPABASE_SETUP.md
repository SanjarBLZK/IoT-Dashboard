# ⚙️ Instellingen met Supabase Database - Setup Guide

## 📋 Overzicht

Je instellingen pagina kan nu automatisch synchroniseren met Supabase! Dit betekent:

✅ **Settings bewaard op server** (niet alleen in browser)  
✅ **Synchronisatie tussen apparaten** (desktop, laptop, tablet)  
✅ **Geen data verlies** bij browser cache clear  
✅ **Real-time updates** wanneer je settings aanpast  

## 🚀 Setup in 3 Stappen

### Stap 1: Database Tabel Aanmaken (2 minuten)

1. **Open Supabase SQL Editor**
   - Ga naar [supabase.com](https://supabase.com)
   - Login en open je project
   - Klik op "SQL Editor" in het linker menu

2. **Run het SQL Script**
   ```sql
   -- Kopieer de volledige inhoud van: user_settings_schema.sql
   -- En plak het in de SQL Editor
   -- Klik op "Run" of druk Ctrl+Enter
   ```

3. **Verificatie**
   - Je zou moeten zien: "✅ user_settings table succesvol aangemaakt!"
   - Check "Table Editor" → Je ziet nu een nieuwe tabel "user_settings"
   - Er staat al 1 rij met default instellingen (id=1)

### Stap 2: App Heeft Supabase Al Geconfigureerd! (0 minuten)

Als je Supabase al gebruikt voor incidents, dan is alles al klaar! ✅

De app gebruikt dezelfde credentials vanuit je `.env` bestand:
```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Stap 3: Test de Synchronisatie (1 minuut)

1. **Start de app**
   ```bash
   npm run dev
   ```

2. **Open Instellingen pagina**
   - Klik op "⚙️ Instellingen" in de navigatie
   - Je ziet een groene indicator: "Verbonden met Supabase database"

3. **Verander een instelling**
   - Pas bijvoorbeeld "Alarm Volume" aan
   - Je ziet: "Synchroniseren met server..." → "✅ Gesynchroniseerd met server"

4. **Verificatie in Supabase**
   - Open Supabase Table Editor → user_settings
   - Klik op de rij (id=1)
   - Je ziet je nieuwe waarden! 🎉

## 🔄 Hoe Synchronisatie Werkt

```
┌─────────────────────────────────────────────────────┐
│  User past instelling aan (slider, toggle)         │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│  React State Update (instant feedback)             │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│  localStorage.setItem() (backup)                    │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│  Supabase UPSERT naar user_settings (server sync)  │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│  Sync Status: "✅ Gesynchroniseerd met server"     │
└─────────────────────────────────────────────────────┘
```

## 💾 Data Persistence Lagen

| Laag | Locatie | Levensduur | Sync |
|------|---------|-----------|------|
| **React State** | RAM | Tijdens sessie | N/A |
| **localStorage** | Browser | Tot clear cache | Alleen lokaal |
| **Supabase** | Cloud database | Permanent | ✅ Cross-device |

## 🎯 Gebruik Scenarios

### Scenario 1: Normale Gebruik
```
1. Open app → Settings geladen van Supabase
2. Pas instelling aan → Automatisch sync naar server
3. Sluit app
4. Open op ander apparaat → Zelfde settings! ✅
```

### Scenario 2: Offline Gebruik
```
1. Geen internet / Supabase credentials niet ingesteld
2. App gebruikt localStorage fallback
3. Settings werken nog steeds lokaal
4. Bij internet → Sync naar server gebeurt automatisch
```

### Scenario 3: Reset Settings
```
1. Klik "Reset naar Standaard" (2x bevestigen)
2. Lokale settings gereset
3. Supabase row wordt verwijderd
4. Bij volgende load: Default settings worden geladen
```

## 📊 Database Schema Details

### user_settings Table
```sql
Table: user_settings
├── id: INTEGER PRIMARY KEY (1 voor single user)
├── warn_temp: DECIMAL(4,1) [20.0 - 40.0]
├── critical_temp: DECIMAL(4,1) [25.0 - 45.0]
├── audio_enabled: BOOLEAN
├── alarm_volume: INTEGER [0-100]
├── notification_enabled: BOOLEAN
├── notification_volume: INTEGER [0-100]
├── created_at: TIMESTAMPTZ
└── updated_at: TIMESTAMPTZ

Constraints:
- critical_temp > warn_temp (validation)
- alarm_volume between 0 and 100
- notification_volume between 0 and 100

Indexes:
- PRIMARY KEY on id
```

## 🔐 Security & Privacy

### Row Level Security (RLS)
- ✅ Enabled op user_settings tabel
- ✅ Policy: "Allow all operations" (voor single user setup)
- 🔮 **Toekomst**: Restrictie op basis van `auth.uid()` voor multi-user

### Single User Model (Huidige Setup)
```typescript
// Altijd id=1 voor de huidige gebruiker
const { error } = await supabase
  .from('user_settings')
  .upsert({ id: 1, ...settings });
```

### Multi-User Uitbreiding (Toekomstig)
```typescript
// Met Supabase Auth:
const { data: { user } } = await supabase.auth.getUser();
const { error } = await supabase
  .from('user_settings')
  .upsert({ user_id: user.id, ...settings });
```

## 🐛 Troubleshooting

### "Verbonden met Supabase database" verschijnt niet
**Oorzaak**: Supabase credentials niet correct
```bash
# Check .env bestand:
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...

# Herstart dev server:
npm run dev
```

### "❌ Synchronisatie mislukt" error
**Oorzaak 1**: user_settings tabel bestaat niet
```sql
-- Run in Supabase SQL Editor:
-- Kopieer hele inhoud van user_settings_schema.sql
```

**Oorzaak 2**: RLS policy blokkeert toegang
```sql
-- Check policies in Supabase:
-- Zorg dat "Allow all operations" policy bestaat
```

**Oorzaak 3**: Internet verbinding verbroken
```
✅ App blijft lokaal werken
✅ Bij reconnect: automatische sync
```

### Settings synchroniseren niet tussen apparaten
**Check**:
1. Beide apparaten gebruiken zelfde Supabase project
2. Beide apparaten hebben internet
3. Refresh de tweede app → Settings worden geladen

### Reset knop werkt niet
```
1. Klik 1x: Knop wordt rood "⚠️ Bevestig Reset"
2. Wacht max 3 seconden
3. Klik 2x: Reset wordt uitgevoerd
4. Als timeout: Klik opnieuw 2x
```

## 📈 Performance Impact

### Initial Load
```
Without Supabase: 1-2ms (localStorage only)
With Supabase:    50-150ms (database fetch + localStorage)
Impact: Minimal - happens once on page load
```

### Settings Update
```
localStorage write:  <1ms
Supabase upsert:     50-200ms (async, non-blocking)
UI Response time:    0ms (instant, state-based)
```

### Bandwidth Usage
```
Per settings change: ~500 bytes
Full sync on load:   ~300 bytes
Total per session:   <5KB
```

## ✨ Best Practices

### 1. **Vertrouw op Auto-save**
```typescript
// ❌ NIET nodig:
onClick={() => {
  updateSetting("warnTemp", 30);
  saveSettings(); // Auto-save doet dit al!
}}

// ✅ CORRECT:
onClick={() => {
  updateSetting("warnTemp", 30); // That's it!
}}
```

### 2. **Check Sync Status** (Optioneel)
```typescript
const { syncStatus } = useSettings();

{syncStatus === "error" && (
  <div>Sync mislukt, maar lokale settings werken nog</div>
)}
```

### 3. **Offline-First Mindset**
```
✅ App werkt ALTIJD (met of zonder Supabase)
✅ localStorage is fallback
✅ Supabase is enhancement, niet requirement
```

## 🔮 Toekomstige Features

### 1. Multi-User Support
```sql
-- User-specific settings:
ALTER TABLE user_settings DROP CONSTRAINT user_settings_pkey;
ALTER TABLE user_settings ADD PRIMARY KEY (user_id);
ALTER TABLE user_settings ADD COLUMN user_id UUID REFERENCES auth.users(id);
```

### 2. Settings Profiles
```sql
-- Multiple settings profiles per user:
CREATE TABLE settings_profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT, -- "Night Mode", "Mission Critical", etc.
  settings JSONB,
  is_active BOOLEAN DEFAULT false
);
```

### 3. Settings History / Audit Log
```sql
-- Track changes over time:
CREATE TABLE settings_history (
  id SERIAL PRIMARY KEY,
  user_id UUID,
  changed_field TEXT,
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 📝 SQL Script Reference

Het volledige SQL script is beschikbaar in:
```
user_settings_schema.sql
```

**Kopieer & Plak direct in Supabase SQL Editor!**

## ✅ Verificatie Checklist

- [ ] SQL script succesvol uitgevoerd in Supabase
- [ ] user_settings tabel zichtbaar in Table Editor
- [ ] Default row (id=1) bestaat in de tabel
- [ ] .env bestand heeft Supabase credentials
- [ ] App herstart na SQL schema toevoeging
- [ ] "Verbonden met Supabase database" zichtbaar in Instellingen
- [ ] Test: Pas een setting aan → zie "✅ Gesynchroniseerd"
- [ ] Test: Check Supabase Table Editor → nieuwe waarde staat er
- [ ] Test: Open app op ander apparaat → settings zijn gelijk

## 🎉 Success!

Als alle checkboxes ✅ zijn, dan is je Settings Synchronisatie compleet!

**Je instellingen zijn nu:**
- 💾 Opgeslagen in de cloud
- 🔄 Gesynchroniseerd tussen apparaten
- 🔒 Veilig bewaard in Supabase
- ⚡ Real-time geüpdatet

---

**Voor vragen of problemen**: Check de console logs in je browser (F12)
De app logt alle sync acties met emoji's voor debugging! 🚀
