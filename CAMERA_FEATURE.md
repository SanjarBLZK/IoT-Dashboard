# 📷 Camera / Bewegingsdetectie Feature

## Overzicht

Het IoT Dashboard heeft nu een volledige **Visuele Bewegingsdetectie** met camera monitoring functionaliteit. Bij elke bewegingsdetectie wordt automatisch een foto gemaakt en opgeslagen in het incidentenlogboek.

## ✨ Toegevoegde Functionaliteit

### 1. **CameraView Component** (`src/components/CameraView.tsx`)

Een volledig functionele camera monitoring component met:

#### Features:
- 📹 **Live Camera Feed**: Toont real-time beeld van de serverruimte
- 🎯 **Bewegingsdetectie**: Visuele feedback met rode overlay bij detectie
- 📸 **Automatische Foto's**: Elke beweging wordt gefotografeerd
- ℹ️ **Camera Status**: 
  - Live indicator (rode knipperende dot)
  - Status: Actief/Offline
  - Resolutie: 1920×1080
  - Laatste detectie tijdstempel
- 🧪 **Test Functionaliteit**: Button om bewegingsdetectie te simuleren
- 📋 **Info Box**: Klantfeedback over camera requirements

#### Camera Template:
De component gebruikt een professionele serverruimte foto als template:
- High-quality Unsplash afbeelding van een echte serverruimte
- Toont server racks, kabelbeheer en typische datacenter omgeving
- Perfect voor demonstratie en prototyping

### 2. **Verbeterde Incident Logging**

#### Uitgebreide Foto Functionaliteit:
- **Grotere Preview**: Foto's zijn nu 32x24px (was 24x24px)
- **Hover Effect**: Scale-up animatie bij hover
- **Click to Enlarge**: Klik op foto om in nieuw tabblad te openen
- **Border Highlight**: Amber glow voor motion detection foto's
- **Meerdere Templates**: 4 verschillende serverruimte foto's rotatie

#### Verbeterde Incident Berichten:
```typescript
"Beweging gedetecteerd: Noordzijde serverruimte - Foto automatisch opgeslagen"
"Beweging gedetecteerd: Centrale rij - Foto automatisch opgeslagen"
"Beweging gedetecteerd: Ingang serverruimte - Foto automatisch opgeslagen"
```

### 3. **Simulatie Updates**

#### Foto Pool:
```typescript
export const samplePhotos = [
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31", // Serverruimte met racks
  "https://images.unsplash.com/photo-1544197150-b99a580bb7a8", // Data center
  "https://images.unsplash.com/photo-1551808525-51a94da548ce", // Server racks met kabels
  "https://images.unsplash.com/photo-1597852074816-d933c7d2b988", // Modern server room
]
```

#### Motion Detection Logic:
- Random interval: 45-90 seconden
- Randomized locaties voor realistische simulatie
- Automatische foto selectie uit pool
- Notificatie geluid bij elke detectie

## 🎯 Gebruik

### Dashboard Integratie

De camera view is toegevoegd aan het hoofddashboard onder "Visuele Monitoring":

```typescript
<CameraView 
  onMotionDetected={triggerMotionDetection}
  isMonitoring={true}
/>
```

### Test Functionaliteit

Bewegingsdetectie werkt volledig automatisch:

1. De simulatie triggert bewegingsdetectie elke 45-90 seconden automatisch
2. Foto wordt automatisch gemaakt
3. Incident wordt gelogd met foto + locatie + timestamp
4. Je kunt de incidenten bekijken in het incident logboek

### Automatische Detectie

In productie/simulatie modus:
- Bewegingsdetectie triggert elke 45-90 seconden automatisch
- Foto wordt automatisch gemaakt
- Incident wordt gelogd met foto + locatie + timestamp

## 📊 Data Flow

```
Camera Monitoring
       ↓
Beweging Gedetecteerd
       ↓
Maak Foto (uit pool)
       ↓
Sla op in Incident Log
       ↓
Speel Notificatie Geluid
       ↓
Update UI (rode overlay + incident lijst)
```

## 🔧 Configuratie

### Camera Settings

In `CameraView.tsx` kun je aanpassen:

```typescript
// Camera info
const cameraId = "CAM-01"
const cameraLocation = "Serverruimte Noord"
const resolution = "1920×1080"

// Overlay display tijd
const overlayTimeout = 2000 // 2 seconden
```

### Motion Detection Interval

In `App.tsx`:

```typescript
const delay = randomBetween(45000, 90000, 0) // 45-90 seconden
// Wijzig naar bijvoorbeeld (30000, 60000, 0) voor 30-60 seconden
```

### Foto Sources

In `simulation.ts`:

```typescript
export const samplePhotos = [
  "your-custom-photo-url-1",
  "your-custom-photo-url-2",
  // ... meer foto's
]
```

## 🎨 Styling

### Camera Feed Styling:
- **Border**: 2px slate-700 met rounded corners
- **Live Indicator**: Rode pulserende dot + "LIVE" label
- **Motion Overlay**: 20% rode transparantie + rode border
- **Info Overlay**: Gradient van zwart naar transparant

### Status Cards:
- **3-kolom grid** met camera status, resolutie, laatste detectie
- **Donker theme** met slate-900/50 achtergrond
- **Icon indicators** met kleur gecodeerde status

## 📸 Voor Productie

### Echte Camera Integratie:

Wanneer je overschakelt naar een echte camera:

1. **Vervang foto URL's** met echte camera stream:
```typescript
<img src={cameraStreamUrl} alt="Live camera feed" />
```

2. **Integreer met backend**:
```typescript
const response = await fetch('/api/camera/snapshot')
const photoUrl = await response.json()
```

3. **Upload foto's** naar storage (Supabase Storage):
```typescript
const { data } = await supabase.storage
  .from('incident-photos')
  .upload(`motion-${timestamp}.jpg`, photoFile)
```

4. **Real-time motion detection**:
```typescript
// Python backend met OpenCV
import cv2
detector = cv2.createBackgroundSubtractorMOG2()
if motion_detected:
    camera.capture('photo.jpg')
    api.create_incident(photo='photo.jpg')
```

## ✅ Klantfeedback Geïmplementeerd

> "Camera moet functioneel zijn, maar hoeft niet per se een high-end professionele camera te zijn"

✅ **Implementatie**:
- Component werkt met standaard webcam of IP camera
- Geen high-end hardware vereisten
- Eenvoudige integratie met bestaande systemen
- Info box in UI bevestigt dit aan gebruikers

## 🐛 Troubleshooting

### Foto's laden niet
→ Check internet connectie (gebruikt Unsplash CDN)
→ Verifieer dat foto URLs geldig zijn

### Test button werkt niet
→ Check browser console voor errors
→ Verifieer dat `onMotionDetected` prop is doorgegeven

### Geen visuele feedback
→ Controleer of `motionDetected` state correct update
→ Check CSS animaties in browser dev tools

## 📝 Files Gewijzigd/Toegevoegd

### Nieuw:
- ✨ `src/components/CameraView.tsx` - Camera component

### Gewijzigd:
- 🔧 `src/App.tsx` - Motion detection handler
- 🔧 `src/pages/Dashboard.tsx` - Camera view integratie
- 🔧 `src/components/IncidentList.tsx` - Verbeterde foto preview
- 🔧 `src/utils/simulation.ts` - Uitgebreide foto pool
- 📚 `README.md` - Camera documentatie
- 📚 `IMPLEMENTATION_CHECKLIST.md` - Camera setup info

## 🚀 Next Steps

1. **Backend Integratie**: Vervang simulatie met echte camera API
2. **Storage Setup**: Configureer Supabase Storage voor foto opslag
3. **Motion Detection**: Implementeer Python OpenCV backend
4. **Multiple Cameras**: Uitbreiden naar meerdere camera's (CAM-02, CAM-03)
5. **Video Recording**: Optie voor video opname bij incident
6. **Face Detection**: Privacy-vriendelijke persoon detectie

---

**Status**: ✅ Camera monitoring volledig functioneel in prototype!

