# 🔧 Browser Cache Fix - Instellingen Niet Zichtbaar

## ✅ Verificatie: Code Zit WEL in Docker

De code is succesvol gedeployed in Docker:
- ✅ Build compleet: 896 modules, 600KB bundle
- ✅ `/settings` route aanwezig in JavaScript
- ✅ Container draait op http://localhost:3000

**Het probleem is browser cache!**

## 🔥 Oplossing 1: Hard Refresh (Quickest)

### Chrome / Edge / Brave
```
Ctrl + Shift + R
```
of
```
Ctrl + F5
```

### Firefox
```
Ctrl + Shift + R
```
of
```
Ctrl + F5
```

## 🔥 Oplossing 2: Clear Cache & Hard Reload

### Chrome / Edge / Brave
1. Open DevTools: `F12`
2. **Right-click** op de refresh button (↻) naast address bar
3. Kies: **"Empty Cache and Hard Reload"**

### Firefox
1. Open DevTools: `F12`
2. Open settings (⚙️ icon in DevTools)
3. Check "Disable HTTP Cache (when toolbox is open)"
4. Refresh met `Ctrl + Shift + R`

## 🔥 Oplossing 3: Incognito/Private Window

### Chrome / Edge / Brave
```
Ctrl + Shift + N
```

### Firefox
```
Ctrl + Shift + P
```

**Dan open:** http://localhost:3000

## 🔥 Oplossing 4: Clear All Browser Data

### Chrome / Edge / Brave
1. `Ctrl + Shift + Delete`
2. Selecteer: "Cached images and files"
3. Time range: "All time"
4. Click "Clear data"

### Firefox
1. `Ctrl + Shift + Delete`
2. Selecteer: "Cache"
3. Time range: "Everything"
4. Click "Clear Now"

## 🔥 Oplossing 5: Force Bust Cache via Docker

### Verander de bundle hash
```bash
# In docker-compose.yml, voeg toe aan build:
build:
  context: .
  args:
    CACHEBUST: 1

# Of rebuild met timestamp:
docker-compose down
docker-compose build --no-cache --build-arg CACHEBUST=$(date +%s)
docker-compose up -d
```

## ✅ Verificatie Stappen

### 1. Check Container
```bash
# Container draait?
docker ps | findstr iot-dashboard

# Settings route in bundle?
docker exec iot-dashboard grep -o '"/settings"' /usr/share/nginx/html/assets/index-VoLPw7-H.js
# Output moet zijn: "/settings" (2x)
```

### 2. Check Browser (F12 Console)
Open http://localhost:3000 en druk F12:

```javascript
// In Console tab, type:
window.location.href = "http://localhost:3000/settings"

// Of check React Router:
console.log(window.location.pathname)
```

### 3. Test Direct URL
```
Direct open in browser:
http://localhost:3000/settings
```

Als je een witte pagina ziet: Browser cache issue  
Als je 404 ziet: Nginx configuratie issue (onwaarschijnlijk)  
Als je settings pagina ziet: **SUCCESS!** ✅

## 🎯 Beste Workflow

**Voor development met Docker:**

1. **Open DevTools EERST** (F12)
2. **Enable "Disable cache"** in Network tab
3. **Keep DevTools open** tijdens development
4. Elke refresh gebruikt nu verse files

**Of gebruik deze URL met cache buster:**
```
http://localhost:3000?cache_bust=1
http://localhost:3000?cache_bust=2
http://localhost:3000?cache_bust=3
```

Verhoog het nummer bij elke test!

## 🔍 Debug Checklist

Probeer in deze volgorde:

- [ ] `Ctrl + Shift + R` (hard refresh)
- [ ] F12 → Network tab → "Disable cache" ✅ → Refresh
- [ ] Incognito venster: `Ctrl + Shift + N`
- [ ] Browser data wissen: `Ctrl + Shift + Delete`
- [ ] Test direct URL: http://localhost:3000/settings
- [ ] Docker rebuild zonder cache (al gedaan!)

## 🚀 Na Fix

Als het werkt, zou je moeten zien:

```
Navigatie:
🏠 Dashboard  |  📋 Incidenten  |  ⚙️ Instellingen  ← Nieuw!

Settings Page:
⚙️ Instellingen
- 🌡️ Temperatuur Drempelwaarden
- 🔊 Audio Instellingen
- Test Alarm knop
```

## 💡 Preventie Toekomstig

### Optie 1: Browser Extensie
Install: **Clear Cache** extensie voor Chrome/Firefox
- One-click cache clear
- Sneller dan manual

### Optie 2: DevTools Altijd Open
```
F12 → Settings → Preferences → ✅ "Disable cache (when DevTools is open)"
```

Houd DevTools open tijdens development!

### Optie 3: Service Worker Clear
```javascript
// In browser console (F12):
navigator.serviceWorker.getRegistrations()
  .then(registrations => {
    registrations.forEach(reg => reg.unregister())
  })
```

## 🆘 Nog Steeds Niet Zichtbaar?

### Check Nginx Logs
```bash
docker logs iot-dashboard --tail 50
```

### Check Build Output
```bash
# Moet "/settings" route bevatten:
docker exec iot-dashboard ls -lh /usr/share/nginx/html/assets/
```

### Manual Check in Container
```bash
docker exec -it iot-dashboard sh
cd /usr/share/nginx/html
cat index.html
ls -la assets/
exit
```

### Test met Curl
```bash
curl http://localhost:3000
curl http://localhost:3000/settings
```

Beide moeten dezelfde HTML teruggeven (SPA!)

---

**TL;DR: Druk `Ctrl + Shift + R` in je browser!** 🎯

Browser cache is bijna altijd het probleem als Docker fresh is gerebuilded! 💾
