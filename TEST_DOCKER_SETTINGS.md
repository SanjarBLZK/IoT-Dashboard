# 🧪 Test: Docker Settings Verificatie

## ✅ Wat We Hebben Geverifieerd

### 1. Code Zit in de Bundle ✅
```bash
# Gezocht naar "Instellingen":
✅ Gevonden: 5+ keer

# Gezocht naar "Temperatuur Drempelwaarden":
✅ Gevonden: 1 keer

# Gezocht naar "/settings" route:
✅ Gevonden: 2 keer
```

### 2. Docker Container Info ✅
```
Image:      iot-dashboard-1-iot-dashboard:latest
Poort:      3000
Timestamps: 12:09 (NET GEBOUWD - 14:09 lokale tijd)
Bundle:     600KB (correct size met nieuwe code)
Modules:    896 (inclusief Settings)
```

### 3. Routing Werkt ✅
```bash
curl http://localhost:3000/settings
# ✅ Returnt correcte HTML met index-VoLPw7-H.js
```

## 🎯 Nu Testen in Browser

### Stap 1: Browser Cache Wissen
```
KRITIEK: Doe dit EERST!

Chrome/Edge/Brave:
1. Druk F12
2. Right-click op refresh button (↻)
3. Kies: "Empty Cache and Hard Reload"

Firefox:
1. Druk Ctrl + Shift + Delete
2. Selecteer "Cache"
3. Klik "Clear Now"
4. Refresh met Ctrl + Shift + R
```

### Stap 2: Open de App
```
URL: http://localhost:3000
```

### Stap 3: Check Navigatie
Je zou moeten zien:
```
┌─────────────────────────────────────────────────────────┐
│  🏠 Dashboard  |  📋 Incidenten  |  ⚙️ Instellingen    │
│                                         ↑↑↑↑↑↑↑↑↑↑↑↑    │
│                                     DEZE MOET ER ZIJN!  │
└─────────────────────────────────────────────────────────┘
```

### Stap 4: Test Direct URL
```
Open in nieuw tabblad: http://localhost:3000/settings

Verwacht resultaat:
┌─────────────────────────────────────────┐
│  ⚙️  Instellingen                      │
│  Pas het dashboard aan...               │
│                                          │
│  🌡️ Temperatuur Drempelwaarden         │
│  - Waarschuwingstemperatuur slider     │
│  - Kritieke temperatuur slider         │
│                                          │
│  🔊 Audio Instellingen                  │
│  - Audio Alerts toggle                  │
│  - Volume sliders                       │
│  - Test Alarm knop                      │
└─────────────────────────────────────────┘
```

## 🐛 Troubleshooting

### Zie je GEEN Settings tab?

#### 1. Check Browser Console (F12)
```javascript
// In Console tab, type:
window.location.pathname
// Output moet zijn: "/" of "/settings"

// Check of React Router werkt:
console.log(document.querySelector('nav'))
// Moet navigation element tonen
```

#### 2. Check Network Tab (F12)
```
F12 → Network tab → Refresh page

Zoek naar: index-VoLPw7-H.js
Status: 200 OK
Size: ~600KB

Als het < 600KB is → Browser cache!
```

#### 3. Incognito Test
```
Ctrl + Shift + N (Chrome/Edge)
Ga naar: http://localhost:3000

Als het WEL werkt in incognito → Browser cache issue!
```

### Zie je WEL Settings tab maar krijg je errors?

#### Check Console Errors
```
F12 → Console tab

Kijk naar rode error messages:
- "useSettings is not defined" → Build probleem
- "Supabase error" → Normaal (geen .env)
- Andere errors → Stuur screenshot
```

## 🎯 Verwachte Browser Gedrag

### First Load (Met Cache)
```
1. Browser laadt oude bundle uit cache
2. Geen Settings tab zichtbaar
3. Console: geen errors (lijkt OK maar is oud!)
```

### After Cache Clear
```
1. Browser download verse bundle (600KB)
2. Settings tab verschijnt in navigatie
3. Klikken → Settings pagina laadt
4. Console: "📚 X incidents geladen uit Supabase"
   (Of warning als geen Supabase geconfigureerd)
```

## 📊 Verificatie Commands

Run deze in PowerShell:

```powershell
# 1. Container draait?
docker ps | findstr iot-dashboard
# Verwacht: STATUS = Up X minutes

# 2. Settings code aanwezig?
docker exec iot-dashboard sh -c "cat /usr/share/nginx/html/assets/index-VoLPw7-H.js" | Select-String "Instellingen"
# Verwacht: Meerdere matches

# 3. URL routing?
curl.exe http://localhost:3000/settings
# Verwacht: HTML met <div id="root"></div>

# 4. Bundle hash?
curl.exe -s http://localhost:3000 | Select-String "index-VoLPw7-H"
# Verwacht: <script ... src="/assets/index-VoLPw7-H.js">
```

Alles ✅? Dan zit het 100% in browser cache!

## 🚀 Final Check

Open Chrome/Edge/Brave en doe:

```
1. Druk F12
2. Network tab
3. Check ✅ "Disable cache"
4. Houd DevTools OPEN
5. Ga naar: http://localhost:3000
6. Refresh
```

De Settings tab MOET er nu zijn! 🎉

## 💡 Waarom Werkt npm run dev WEL?

```
npm run dev:
- ✅ Geen cache (development server)
- ✅ Hot reload (automatisch verse code)
- ✅ Source maps (makkelijk debuggen)
- Poort: 5173

Docker:
- ⚠️ Browser cache (aggressive)
- ⚠️ Statische files (geen hot reload)
- ⚠️ Production build (minified)
- Poort: 3000
```

**Oplossing**: Cache wissen tussen builds!

## ✅ Success Criteria

Je hebt SUCCESS als:

1. ✅ Navigatie toont: 🏠 Dashboard | 📋 Incidenten | ⚙️ Instellingen
2. ✅ Klikken op "Instellingen" laadt de pagina
3. ✅ Settings pagina toont:
   - Temperatuur sliders
   - Audio toggles
   - Test Alarm knop
4. ✅ URL is: http://localhost:3000/settings
5. ✅ Geen errors in console (F12)

---

**Status**: Docker build bevat 100% de nieuwe code! ✅  
**Probleem**: Browser cache (als tab niet zichtbaar is)  
**Oplossing**: Hard refresh of incognito window  

🎯 **Test het nu met Ctrl + Shift + N (incognito) → http://localhost:3000**
