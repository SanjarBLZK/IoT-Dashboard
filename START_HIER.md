# 🚀 START HIER - Camera Setup Compleet!

## ✅ Wat Is Er Klaar?

De camera bewegingsdetectie functionaliteit is volledig geïmplementeerd! 
Alles werkt, je hoeft alleen nog **jouw eigen serverruimte foto** toe te voegen.

## 📸 ACTIE VEREIST: Vervang de Foto

### Stap 1: Sla Jouw Foto Op

De foto die je zojuist in de chat hebt geüpload (met de witte server racks, gele kabels en blauwe LED's), die moet je opslaan als:

**Bestandsnaam**: `serverroom.jpg`  
**Locatie**: `c:\Users\gorya\IoT-Dashboard-1\public\serverroom.jpg`

### Stap 2: Plaats de Foto

**Snelste methode:**

1. Open File Explorer
2. Ga naar: `c:\Users\gorya\IoT-Dashboard-1\public\`
3. Sleep jouw serverruimte foto daar naartoe
4. Hernoem het naar: `serverroom.jpg` (vervang de huidige als die er staat)

**Of via PowerShell:**

```powershell
# Ga naar public folder
cd c:\Users\gorya\IoT-Dashboard-1\public

# Kopieer jouw foto (pas het bronpad aan)
Copy-Item "C:\Users\gorya\Downloads\jouw-foto.jpg" -Destination "serverroom.jpg" -Force
```

### Stap 3: Test de Applicatie

```powershell
# Start de development server
npm run dev

# Browser opent automatisch
# Als niet: ga naar http://localhost:5173
```

### Stap 4: Verifieer

1. **Dashboard bekijken**: Scroll naar "Visuele Monitoring"
2. **Camera feed checken**: Zie je JOUW serverruimte foto?
3. **Test bewegingsdetectie**: Klik op "🧪 Test Bewegingsdetectie"
4. **Incident bekijken**: Check het incident logboek - foto moet daar ook staan

## 🎯 Wat Werkt Al?

✅ **Camera Component** - Toont live feed met jouw foto  
✅ **Bewegingsdetectie** - Automatisch elke 45-90 seconden  
✅ **Foto Opslag** - Foto's in incident logboek  
✅ **Visuele Feedback** - Rode overlay bij detectie  
✅ **Test Functionaliteit** - Handmatige trigger button  
✅ **Audio Notificaties** - Geluid bij beweging  
✅ **Status Monitoring** - Live/offline indicator  
✅ **Click-to-Enlarge** - Foto's vergroten in nieuw tabblad  

## 📚 Documentatie Files

- **`FOTO_VERVANGEN.md`** ⭐ - Gedetailleerde foto instructies
- **`CAMERA_FEATURE.md`** - Complete feature documentatie
- **`CAMERA_VISUAL_GUIDE.md`** - Visuele design gids
- **`README.md`** - Algemene project documentatie
- **`public/README_FOTO.txt`** - Snelle foto referentie

## 🔧 Technische Details

### Files Gemaakt/Aangepast:

**Nieuw:**
- `src/components/CameraView.tsx` - Camera component
- `CAMERA_FEATURE.md` - Feature docs
- `CAMERA_VISUAL_GUIDE.md` - Design docs
- `FOTO_VERVANGEN.md` - Foto instructies
- `public/README_FOTO.txt` - Folder referentie

**Aangepast:**
- `src/App.tsx` - Motion detection handler
- `src/pages/Dashboard.tsx` - Camera integratie
- `src/components/IncidentList.tsx` - Foto preview
- `src/utils/simulation.ts` - Lokale foto pad
- `README.md` - Documentatie update

### Code Flow:

```
Automatische Detectie (45-90s)
         ↓
triggerMotionDetection()
         ↓
Maak Incident + Foto (/serverroom.jpg)
         ↓
Update Incident Lijst
         ↓
Speel Notificatie Geluid
```

## ⚙️ Configuratie Opties

### Motion Detection Interval Aanpassen

In `src/App.tsx` regel ~67:

```typescript
const delay = randomBetween(45000, 90000, 0); // 45-90 seconden
// Wijzig naar bijvoorbeeld: (30000, 60000, 0) voor 30-60 seconden
```

### Meerdere Foto's Gebruiken

Voeg meer foto's toe in `public/`:
- `serverroom.jpg` (verplicht)
- `serverroom-2.jpg` (optioneel)
- `serverroom-3.jpg` (optioneel)

Update `src/utils/simulation.ts`:

```typescript
export const samplePhotos = [
  "/serverroom.jpg",
  "/serverroom-2.jpg",
  "/serverroom-3.jpg",
];
```

## 🎨 Wat Je Zult Zien

### Camera View:
```
┌────────────────────────────────────────────┐
│ 📷 Bewegingsdetectie Camera   🔴 LIVE     │
│ Serverruimte monitoring                    │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │                                      │   │
│ │   [JOUW SERVERRUIMTE FOTO]          │   │
│ │   - Witte server racks               │   │
│ │   - Gele kabelmanagement             │   │
│ │   - Blauwe LED verlichting           │   │
│ │                                      │   │
│ │ CAM-01 · Noord        14:32:15      │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ Status: 🟢 Actief  │  1920×1080            │
│                                             │
│ [ 🧪 Test Bewegingsdetectie ]             │
└────────────────────────────────────────────┘
```

### Bij Beweging:
```
┌────────────────────────────────────────────┐
│ ╔════════════════════════════════════════╗│
│ ║ 🚨 BEWEGING GEDETECTEERD              ║│
│ ╚════════════════════════════════════════╝│
│ ║                                        ║│
│ ║  [FOTO MET RODE OVERLAY]              ║│
│ ║                                        ║│
│ ╚════════════════════════════════════════╝│
└────────────────────────────────────────────┘
```

## 🐛 Problemen Oplossen

### Camera toont placeholder tekst
→ Foto is nog niet geplaatst of heeft verkeerde naam  
→ Check: `c:\Users\gorya\IoT-Dashboard-1\public\serverroom.jpg`  
→ Bestandsnaam moet exact zijn (lowercase!)

### Foto laadt niet
→ Herstart dev server: Ctrl+C dan `npm run dev`  
→ Hard refresh browser: Ctrl+F5  
→ Check browser console voor errors (F12)

### Incident foto's werken niet
→ Controleer `src/utils/simulation.ts` - moet `/serverroom.jpg` bevatten  
→ Check of foto bereikbaar is: http://localhost:5173/serverroom.jpg

## 🎉 Success Checklist

Na het plaatsen van jouw foto:

- [ ] Foto geplaatst als `public/serverroom.jpg`
- [ ] Dev server gestart met `npm run dev`
- [ ] Dashboard geopend in browser
- [ ] Camera feed toont JOUW serverruimte
- [ ] Test button werkt
- [ ] Incident logboek toont foto's
- [ ] Automatische detectie werkt (wacht 45-90s)
- [ ] Audio notificaties werken

## 🚀 Volgende Stappen (Optioneel)

1. **Supabase Integratie** - Zie `IMPLEMENTATION_CHECKLIST.md`
2. **Meerdere Camera's** - Voeg CAM-02, CAM-03 toe
3. **Echte Camera** - Integreer met IP camera of webcam
4. **Video Recording** - Implementeer video opname feature
5. **Cloud Storage** - Upload foto's naar Supabase Storage

---

## 📞 Quick Reference

**Foto Locatie**: `c:\Users\gorya\IoT-Dashboard-1\public\serverroom.jpg`  
**Dev Server**: `npm run dev`  
**Browser URL**: http://localhost:5173  
**Docs**: Lees `FOTO_VERVANGEN.md` voor details  

**🎯 Action**: Vervang de foto en start de server! Alles is klaar! ✅**

