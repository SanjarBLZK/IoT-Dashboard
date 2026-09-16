# 🐳 Docker Problemen Oplossen

## Probleem: "Failed to connect to the docker API"

### Error Bericht:
```
failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine
check if the path is correct and if the daemon is running
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified
```

Dit betekent: **Docker Desktop is niet gestart of niet geïnstalleerd**

---

## ✅ Oplossing 1: Start Docker Desktop

### Windows:

1. **Druk op Windows toets**
2. **Type**: "Docker Desktop"
3. **Klik** op Docker Desktop om te starten
4. **Wacht** tot Docker volledig opgestart is (whale icon in system tray wordt stabiel)
5. **Test**:
   ```powershell
   docker --version
   docker ps
   ```

### Als Docker Desktop Niet Verschijnt:

Docker is waarschijnlijk niet geïnstalleerd → Ga naar **Oplossing 2**

---

## ✅ Oplossing 2: Installeer Docker Desktop (Als Nodig)

### Download & Installeer:

1. **Ga naar**: https://www.docker.com/products/docker-desktop/
2. **Download** Docker Desktop voor Windows
3. **Installeer** (volg de wizard)
4. **Herstart** je computer (verplicht!)
5. **Start** Docker Desktop
6. **Test**:
   ```powershell
   docker --version
   # Zou moeten tonen: Docker version 24.x.x
   ```

### Systeemvereisten:

- Windows 10 64-bit: Pro, Enterprise, of Education (Build 19041 of hoger)
- WSL 2 feature enabled
- Hyper-V enabled (of WSL 2 backend)
- Minimaal 4GB RAM

---

## ✅ Oplossing 3: Je Hebt Docker Helemaal Niet Nodig!

**Goede nieuws**: Voor dit IoT Dashboard heb je **geen Docker nodig**.

### Waarom Docker Compose Bestaat in Dit Project:

Het `docker-compose.yml` bestand is optioneel voor:
- **Productie deployment** (server hosting)
- **Container orchestration**
- **Geïsoleerde environments**

### Voor Development (Nu):

Je hoeft **GEEN Docker** te gebruiken! Gebruik gewoon:

```powershell
npm run dev
```

Dit start de development server **zonder Docker**.

---

## 🎯 Aanbeveling voor Jou

### Scenario 1: Je Wilt Alleen Ontwikkelen/Testen

**→ Gebruik NPM (Geen Docker)**

```powershell
# Dit is alles wat je nodig hebt:
npm install
npm run dev

# Browser opent op http://localhost:5173
```

**Voordelen:**
- ✅ Sneller
- ✅ Geen extra software
- ✅ Eenvoudiger debugging
- ✅ Hot reload werkt perfect

**Nadelen:**
- ❌ Geen

### Scenario 2: Je Wilt Deployen naar Productie Server

**→ Gebruik Docker**

Maar **eerst** moet je Docker Desktop installeren en starten (zie boven).

Dan:
```powershell
docker-compose up -d
```

---

## 🔧 Docker Fixes (Als Je Docker Wilt Gebruiken)

### Fix 1: docker-compose.yml Warning

**Probleem:**
```
the attribute `version` is obsolete
```

**Oplossing:**
✅ **Already fixed!** Ik heb de `version: '3.8'` regel verwijderd.

### Fix 2: Docker Not Running

**Check of Docker draait:**
```powershell
docker info
```

**Als error → Start Docker Desktop (zie Oplossing 1)**

### Fix 3: WSL 2 Not Installed (Windows)

**Error:**
```
WSL 2 installation is incomplete
```

**Oplossing:**
```powershell
# Run als Administrator
wsl --install
wsl --set-default-version 2

# Herstart computer
```

### Fix 4: Hyper-V Not Enabled

**Error:**
```
Hyper-V is not enabled
```

**Oplossing:**
1. Open PowerShell **als Administrator**
2. Run:
   ```powershell
   Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
   ```
3. Herstart computer

---

## 📋 Quick Decision Guide

```
Do you need to:
│
├─ Develop locally? 
│  └─→ Use npm run dev (NO DOCKER NEEDED) ✅
│
├─ Test in production-like environment?
│  └─→ Use Docker (Install Docker Desktop first)
│
├─ Deploy to a server?
│  └─→ Use Docker (On the server)
│
└─ Just learn/experiment?
   └─→ Use npm run dev (Easiest!) ✅
```

---

## ✅ Wat Ik Voor Jou Heb Gefixed

1. **docker-compose.yml**
   - ✅ Verouderde `version:` regel verwijderd
   - ✅ Warning verdwenen
   - ✅ Modern format

2. **Dockerfile Check**
   - Laat me checken of deze ook goed is...

---

## 🚀 Volgende Stappen

### Optie A: Continue Zonder Docker (Aanbevolen Nu)

```powershell
# Gewoon dit gebruiken:
npm run dev

# Alles werkt!
```

### Optie B: Docker Gebruiken (Later, Als Nodig)

```powershell
# 1. Installeer Docker Desktop
# 2. Start Docker Desktop
# 3. Wacht tot whale icon stabiel is
# 4. Run:
docker-compose up -d
```

---

## 🐛 Troubleshooting Commands

```powershell
# Check Docker status
docker --version
docker info
docker ps

# Check WSL (Windows)
wsl --status
wsl --list --verbose

# Restart Docker Desktop (Windows)
# 1. Klik op whale icon in system tray
# 2. Klik "Quit Docker Desktop"
# 3. Start opnieuw

# Check if process is running
Get-Process "Docker Desktop"
```

---

## 📞 Als Je Nog Steeds Errors Hebt

### Error: "Docker daemon not accessible"

1. Start Docker Desktop
2. Wacht 30 seconden
3. Probeer opnieuw

### Error: "Permission denied"

Run PowerShell **als Administrator**

### Error: "Port 3000 already in use"

**Optie 1:** Stop andere applicatie op poort 3000
```powershell
# Vind wat er draait op poort 3000
netstat -ano | findstr :3000

# Stop process (vervang PID)
taskkill /PID <process_id> /F
```

**Optie 2:** Wijzig poort in docker-compose.yml
```yaml
ports:
  - "3001:80"  # Gebruik 3001 in plaats van 3000
```

---

## 🎯 Samenvatting

**Voor nu:**
```powershell
# Gebruik gewoon NPM - geen Docker nodig!
npm run dev
```

**docker-compose.yml warning:**
- ✅ Opgelost (version verwijderd)

**Docker daemon error:**
- → Je hebt Docker Desktop niet gestart/geïnstalleerd
- → Dit is OK! Je hebt het nu niet nodig
- → Gebruik npm run dev

**Als je Docker later wilt:**
1. Installeer Docker Desktop
2. Start het
3. Run `docker-compose up -d`

---

**Status**: ✅ Docker compose warning gefixed! App werkt zonder Docker via `npm run dev`

