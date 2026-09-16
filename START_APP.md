# 🚀 Start de IoT Dashboard App

## Quick Start (Aanbevolen)

```powershell
# Start development server (GEEN Docker nodig!)
npm run dev
```

Browser opent automatisch op: http://localhost:5173

---

## ⚠️ Docker Error Gezien?

Als je deze error zag:
```
failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine
```

**Dit is geen probleem!** Je hoeft Docker niet te gebruiken.

### Wat Gebeurde:
- Iemand probeerde `docker-compose up` te runnen
- Docker Desktop was niet gestart
- Dit geeft een error

### Oplossing:
**Gebruik gewoon NPM in plaats van Docker:**

```powershell
npm run dev
```

**Dat is alles!** ✅

---

## 📋 Twee Manieren om de App te Starten

### Optie 1: NPM Development Server (Makkelijkst)

**Voor:**
- ✅ Local development
- ✅ Snelle reload
- ✅ Easy debugging
- ✅ Geen extra software

**Start:**
```powershell
npm run dev
```

**Port:** http://localhost:5173

---

### Optie 2: Docker (Optioneel, Voor Productie)

**Voor:**
- ✅ Production deployment
- ✅ Server hosting
- ✅ Container orchestration

**Vereist:**
1. Docker Desktop geïnstalleerd
2. Docker Desktop gestart (whale icon in system tray)

**Start:**
```powershell
docker-compose up -d
```

**Port:** http://localhost:3000

---

## 🔧 Fixes Toegepast

### 1. docker-compose.yml Warning Gefixed ✅

**Was:**
```yaml
version: '3.8'  # ← Verouderd, gaf warning

services:
  ...
```

**Nu:**
```yaml
# version verwijderd - niet meer nodig in Docker Compose v2+

services:
  ...
```

**Resultaat:** Geen warning meer! ✅

---

### 2. Docker Daemon Error Uitgelegd ✅

**Error betekent:**
- Docker Desktop is niet gestart/geïnstalleerd
- Je probeerde docker-compose te runnen

**Oplossing:**
- Gebruik `npm run dev` (geen Docker nodig)
- OF start Docker Desktop eerst

**Zie:** `DOCKER_FIX.md` voor gedetailleerde uitleg

---

## ✅ App Starten - Stap voor Stap

### Eerste Keer:

```powershell
# 1. Installeer dependencies (eenmalig)
npm install

# 2. Voeg je serverruimte foto toe
# Plaats serverroom.jpg in public/ folder

# 3. Optioneel: Configureer Supabase
# Kopieer .env.example naar .env
# Vul credentials in (zie CAMERA_SUPABASE_SETUP.md)

# 4. Start dev server
npm run dev
```

### Volgende Keren:

```powershell
# Gewoon starten
npm run dev
```

---

## 🎯 Welke Modus Gebruik Je?

### Development (Nu):
```powershell
npm run dev
```
- Werkt lokaal
- Hot reload
- Incidents verdwijnen bij reload (tenzij Supabase geconfigureerd)

### Development + Database:
```powershell
# 1. Setup Supabase (zie CAMERA_SUPABASE_SETUP.md)
# 2. Start app
npm run dev
```
- Werkt lokaal
- Hot reload  
- Incidents blijven bewaard in database ✅

### Production (Server):
```powershell
# 1. Start Docker Desktop
# 2. Build & run
docker-compose up -d
```
- Draait in container
- Nginx als webserver
- Production optimized

---

## 🐛 Problemen?

### Error: "Port 5173 already in use"

**Oplossing 1:** Stop andere Vite server
```powershell
# Druk Ctrl+C in terminal waar npm run dev draait
```

**Oplossing 2:** Kill process
```powershell
# Vind process
netstat -ano | findstr :5173

# Stop het (vervang PID)
taskkill /PID <process_id> /F
```

### Error: "Module not found"

**Oplossing:**
```powershell
# Herinstalleer dependencies
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Error: "Supabase credentials not found"

**Dit is geen error!** Het is een waarschuwing.

**Betekent:**
- App werkt nog steeds
- Incidents worden alleen lokaal opgeslagen
- Om database opslag te krijgen: zie `CAMERA_SUPABASE_SETUP.md`

### Error: Docker niet gevonden

**Je hebt Docker niet nodig!**

```powershell
# Gebruik gewoon:
npm run dev
```

---

## 📚 Meer Informatie

- **Docker Problemen**: `DOCKER_FIX.md`
- **Supabase Setup**: `CAMERA_SUPABASE_SETUP.md`  
- **Camera Feature**: `CAMERA_FEATURE.md`
- **Algemeen**: `README.md`

---

## 🎉 Samenvatting

**Om de app te starten:**
```powershell
npm run dev
```

**Docker error gezien?**
- Negeer het - je hebt Docker niet nodig
- docker-compose.yml warning is gefixed

**Alles werkt nu! 🚀**

---

**Quick Commands:**

```powershell
# Start app
npm run dev

# Build voor productie
npm run build

# Preview productie build
npm run preview

# Lint code
npm run lint
```

**Browser:** http://localhost:5173

**Status:** ✅ Klaar om te starten!

