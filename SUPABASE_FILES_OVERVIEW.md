# 📚 Supabase Documentatie - Files Overzicht

Deze memorybank bevat alle documentatie om je IoT Dashboard van simulatie naar Supabase te migreren.

## 📁 Documentatie Files

### 1️⃣ **SUPABASE_SETUP.md** (Hoofddocument)
**📄 Inhoud:** Complete handleiding voor Supabase integratie  
**📖 Secties:**
- Waarom Supabase?
- Project setup stap-voor-stap
- Database schema uitleg
- Environment variables configuratie
- Frontend integratie code
- Authenticatie implementatie
- Real-time subscriptions
- API service laag
- Testing instructies
- Troubleshooting

**🎯 Wanneer gebruiken:**  
Als je een complete, gedetailleerde uitleg wilt van het hele proces.

---

### 2️⃣ **IMPLEMENTATION_CHECKLIST.md** (Quick Start)
**📄 Inhoud:** Stap-voor-stap checklist met checkboxes  
**📋 Checklist items:**
- ✅ Database setup (15 min)
- ✅ Real-time configuratie (2 min)
- ✅ Environment setup (5 min)
- ✅ Dependencies installeren (2 min)
- ✅ Code files aanmaken
- ✅ App.tsx refactoren
- ✅ Testing (10 min)
- ✅ Productie checklist

**🎯 Wanneer gebruiken:**  
Als je snel aan de slag wilt met concrete actiestappen.

---

### 3️⃣ **supabase_schema.sql** (Database Script)
**📄 Inhoud:** Complete SQL script voor database setup  
**🗄️ Bevat:**
```sql
✅ 5 tabellen (racks, sensor_data, devices, incidents, settings)
✅ Indexes voor performance
✅ 2 Views (latest_sensor_readings, rack_overview)
✅ Functions & Triggers (auto-update timestamps)
✅ Row Level Security policies
✅ Seed data (3 racks + 180 sensor readings + devices)
✅ Verificatie queries
```

**🎯 Wanneer gebruiken:**  
Copy-paste dit hele bestand in Supabase SQL Editor en klik RUN.

---

### 4️⃣ **.env.example** (Environment Template)
**📄 Inhoud:** Template voor environment variables  
**🔑 Variabelen:**
```env
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**🎯 Wanneer gebruiken:**  
1. Kopieer naar `.env`
2. Vul credentials in uit Supabase dashboard
3. Restart dev server

---

## 🚀 Quick Start Guide (5 minuten)

### Voor wie haast heeft:

1. **Database opzetten:**
   ```bash
   # 1. Open Supabase SQL Editor
   # 2. Kopieer inhoud van supabase_schema.sql
   # 3. Klik RUN
   ```

2. **Environment configureren:**
   ```bash
   # 1. Kopieer .env.example naar .env
   cp .env.example .env
   
   # 2. Vul credentials in (uit Supabase dashboard)
   # 3. Sla op
   ```

3. **Dependencies installeren:**
   ```bash
   npm install @supabase/supabase-js
   ```

4. **Code implementeren:**
   - Volg `IMPLEMENTATION_CHECKLIST.md` stappen 5-6
   - Of lees `SUPABASE_SETUP.md` sectie "Frontend Integratie"

5. **Testen:**
   ```bash
   npm run dev
   # Dashboard zou nu data uit Supabase moeten halen!
   ```

---

## 📊 Database Schema Overzicht

```
┌─────────────┐
│   racks     │
│─────────────│
│ id (PK)     │──┐
│ name        │  │
│ location    │  │
└─────────────┘  │
                 │
       ┌─────────┴─────────┬─────────────┬─────────────┐
       │                   │             │             │
       ▼                   ▼             ▼             ▼
┌──────────────┐    ┌──────────┐  ┌───────────┐  ┌──────────┐
│ sensor_data  │    │ devices  │  │ incidents │  │ settings │
│──────────────│    │──────────│  │───────────│  │──────────│
│ id (PK)      │    │ id (PK)  │  │ id (PK)   │  │ id (PK)  │
│ rack_id (FK) │    │ rack_id  │  │ rack_id   │  │ rack_id  │
│ temperature  │    │ name     │  │ type      │  │ temp_*   │
│ humidity     │    │ status   │  │ message   │  │ humidity*│
│ sound_level  │    └──────────┘  │ photo_url │  └──────────┘
│ timestamp    │                  │ timestamp │
└──────────────┘                  └───────────┘
```

### Belangrijke Views:

**`latest_sensor_readings`**  
→ Laatste meting per rack (snel!)

**`rack_overview`**  
→ Complete rack info + status + devices count

---

## 🔐 Security Checklist

- ✅ `.env` staat in `.gitignore`
- ✅ Alleen `anon` key in frontend (NOOIT `service_role`)
- ✅ Row Level Security (RLS) enabled op alle tabellen
- ✅ Read-only policies voor public access
- ✅ Write access alleen voor authenticated users

---

## 🧪 Testing Scenarios

### Scenario 1: Real-time Sensor Update
```sql
-- Run in Supabase SQL Editor
INSERT INTO sensor_data (rack_id, temperature, humidity)
VALUES (1, 38.5, 52.0);
```
**✅ Verwacht:** Dashboard update zonder refresh, audio alarm bij >35°C

### Scenario 2: Bewegingsdetectie
```sql
INSERT INTO incidents (type, message, photo_url)
VALUES ('motion', 'Test beweging', 'https://placekitten.com/400/400');
```
**✅ Verwacht:** Incident verschijnt live, notification sound

### Scenario 3: Settings Update
```sql
UPDATE settings SET temp_critical_threshold = 30.0 WHERE rack_id = 1;
```
**✅ Verwacht:** Lagere drempel → meer kritieke alerts

---

## 📈 Data Flow Diagram

```
IoT Sensors (Raspberry Pi)
         │
         │ POST /api
         ▼
    Supabase Database
         │
         ├─→ INSERT trigger
         │   └─→ Real-time broadcast
         │
         ├─→ Views (automatic)
         │   └─→ rack_overview
         │
         ▼
   Frontend (React)
         │
         ├─→ Initial fetch (useEffect)
         ├─→ Real-time subscribe (channels)
         └─→ UI update (setState)
```

---

## 🆘 Common Issues & Fixes

| **Probleem** | **Oplossing** |
|-------------|---------------|
| "Missing env vars" | Restart dev server: `Ctrl+C` → `npm run dev` |
| "Failed to fetch" | Check Supabase URL/key in `.env` |
| "RLS violation" | Verify policies in Supabase dashboard > Authentication > Policies |
| Real-time not working | Enable replication: Database > Replication |
| "Cannot find module" | Run `npm install @supabase/supabase-js` |

---

## 📞 Support & Resources

### Documentatie:
- 📘 [Supabase Docs](https://supabase.com/docs)
- 📗 [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- 📕 [Real-time Guide](https://supabase.com/docs/guides/realtime)

### Video Tutorials:
- [Supabase Crash Course](https://www.youtube.com/watch?v=7uKQBl9uZ00)
- [Real-time with Supabase](https://www.youtube.com/watch?v=CGZw6pCUlYo)

### Community:
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Discussions](https://github.com/supabase/supabase/discussions)

---

## 🎯 Implementatie Tijdlijn

| **Fase** | **Tijd** | **Status** |
|----------|----------|-----------|
| 1. Supabase project setup | 10 min | ⏳ Todo |
| 2. Database schema uitvoeren | 5 min | ⏳ Todo |
| 3. Environment configureren | 5 min | ⏳ Todo |
| 4. Dependencies installeren | 2 min | ⏳ Todo |
| 5. Code implementeren | 30 min | ⏳ Todo |
| 6. Testing | 10 min | ⏳ Todo |
| **TOTAAL** | **~1 uur** | |

---

## ✅ Completion Checklist

- [ ] Alle 4 documentatie files gelezen
- [ ] Supabase account aangemaakt
- [ ] Database schema uitgevoerd (supabase_schema.sql)
- [ ] `.env` file geconfigureerd
- [ ] Dependencies geïnstalleerd
- [ ] Code gerefactored (simulatie → Supabase)
- [ ] Real-time subscriptions werkend
- [ ] Alle tests geslaagd
- [ ] Dashboard draait op Supabase! 🎉

---

**📅 Versie:** 1.0  
**✍️ Auteur:** IoT Dashboard Team  
**🔄 Laatst bijgewerkt:** 2024

**🎊 Succes met je Supabase migratie!**
