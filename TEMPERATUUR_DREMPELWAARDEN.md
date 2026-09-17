# 🌡️ Temperatuur Drempelwaarden - Hoe Het Werkt

## ✅ Ja, Het Werkt Direct!

Als je de temperatuur drempelwaarden aanpast in de Settings pagina, **werken ze direct**.

## 🎯 Hoe Te Gebruiken

### Stap 1: Open Settings

1. **Start de app**: `npm run dev`
2. **Klik** op "Instellingen" in de navigatie (⚙️ icoon)
3. **Je ziet** twee sliders:
   - 🟠 **Waarschuwingstemperatuur** (oranje) - Default: 28°C
   - 🔴 **Kritieke temperatuur** (rood) - Default: 35°C

### Stap 2: Pas Drempelwaarden Aan

**Sleep de sliders** naar gewenste waarde:

```
Waarschuwing: 20°C ←──●──────────→ 40°C
Kritiek:      25°C ←─────────●───→ 45°C
```

**Bijvoorbeeld:**
- Waarschuwing: 30°C (was 28°C)
- Kritiek: 38°C (was 35°C)

### Stap 3: Opslaan (Optioneel)

**Klik** op "💾 Instellingen Opslaan"

> ⚡ **Let op**: Settings worden **automatisch gebruikt**, zelfs zonder opslaan!  
> De "Opslaan" knop is alleen voor visuele bevestiging.

### Stap 4: Effect Zien

**Direct na aanpassen:**

1. **Racks krijgen nieuwe status** op basis van nieuwe drempels
2. **Kleuren veranderen**:
   - 🟢 Groen: < 30°C (jouw nieuwe waarschuwingsdrempel)
   - 🟠 Oranje: 30°C - 38°C
   - 🔴 Rood: ≥ 38°C (jouw nieuwe kritieke drempel)

3. **Alarms triggeren** op nieuwe kritieke temperatuur

## 🔧 Technische Details

### Hoe Het Werkt Achter de Schermen:

```typescript
// 1. Settings Hook (in App.tsx)
const { settings } = useSettings();
// settings.warnTemp = 28 (of jouw aangepaste waarde)
// settings.criticalTemp = 35 (of jouw aangepaste waarde)

// 2. Sensor Update (elke minuut)
setRacks((prevRacks) =>
  prevRacks.map((rack) => 
    updateRackWithNewReading(
      rack, 
      settings.warnTemp,      // ← Jouw waarschuwingsdrempel
      settings.criticalTemp   // ← Jouw kritieke drempel
    )
  )
);

// 3. Status Bepalen (in simulation.ts)
export function deriveStatus(
  temp: number, 
  warnTemp: number = 28,      // ← Dynamisch!
  criticalTemp: number = 35   // ← Dynamisch!
): RackStatus {
  if (temp >= criticalTemp) return "critical";  // Rood
  if (temp >= warnTemp) return "warn";          // Oranje
  return "ok";                                   // Groen
}
```

### Data Flow:

```
Settings Pagina
    ↓
Slider Aanpassen (bijv. 30°C)
    ↓
useSettings() hook update
    ↓
settings.warnTemp = 30
    ↓
App.tsx gebruikt settings.warnTemp
    ↓
updateRackWithNewReading(rack, 30, 35)
    ↓
deriveStatus(temp, 30, 35)
    ↓
Nieuwe status berekend
    ↓
UI update met nieuwe kleuren
    ↓
Alarm triggered als critical
```

## 📊 Voorbeelden

### Voorbeeld 1: Strengere Drempels

**Stel in:**
- Waarschuwing: 25°C (was 28°C)
- Kritiek: 30°C (was 35°C)

**Effect:**
- Rack met 26°C: 🟢 OK → 🟠 Waarschuwing ⚠️
- Rack met 31°C: 🟠 Waarschuwing → 🔴 Kritiek 🚨

### Voorbeeld 2: Soepeler Drempels

**Stel in:**
- Waarschuwing: 32°C (was 28°C)
- Kritiek: 40°C (was 35°C)

**Effect:**
- Rack met 29°C: 🟠 Waarschuwing → 🟢 OK ✅
- Rack met 36°C: 🔴 Kritiek → 🟠 Waarschuwing ⚠️

### Voorbeeld 3: Extreem Gevoelig

**Stel in:**
- Waarschuwing: 22°C
- Kritiek: 26°C

**Effect:**
- Bijna alle racks krijgen waarschuwing/kritiek status
- Veel alarms (voor data center met strikte eisen)

### Voorbeeld 4: Relaxed (Testing)

**Stel in:**
- Waarschuwing: 35°C
- Kritiek: 40°C

**Effect:**
- Bijna geen waarschuwingen
- Alleen kritiek bij extreme temperaturen
- Goed voor testen zonder alarms

## 💾 Opslag

### Zonder Supabase (Default):

**Settings worden opgeslagen in:**
- Browser LocalStorage
- Per apparaat
- Blijft behouden na reload
- ❌ Niet gesynchroniseerd tussen apparaten

### Met Supabase (Aanbevolen):

**Settings worden opgeslagen in:**
- ✅ Supabase database
- ✅ Gesynchroniseerd tussen alle apparaten
- ✅ Real-time updates
- ✅ Backup in cloud

**Setup:** Zie `CAMERA_SUPABASE_SETUP.md`

## 🎮 Live Testen

### Test Scenario:

```powershell
# 1. Start app
npm run dev

# 2. Open browser (2 tabs)
# Tab 1: Dashboard
# Tab 2: Settings

# 3. In Tab 2 (Settings):
# - Verlaag kritieke drempel naar 30°C
# - Sla op

# 4. In Tab 1 (Dashboard):
# - Watch racks: als temp > 30°C → rood
# - Alarm gaat af
# - Incident wordt gelogd

# 5. In Tab 2 (Settings):
# - Verhoog kritieke drempel naar 40°C
# - Sla op

# 6. In Tab 1 (Dashboard):
# - Watch racks: rood → oranje/groen
# - Alarm stopt
```

## ⚡ Real-time Updates

**Settings updates worden DIRECT doorgevoerd:**

```
Slider bewegen → Waarde update → Direct effect

Geen page reload nodig!
Geen manual refresh!
```

**React's reactivity zorgt ervoor:**
1. Settings hook update
2. Component re-render
3. Nieuwe drempels gebruikt
4. Status herberekend
5. UI update

**Dit gebeurt in milliseconden!** ⚡

## 🚨 Alarm Behavior

### Bij Kritieke Temperatuur Overschrijden:

**Als temp ≥ critical:**
1. 🔴 Status wordt "critical"
2. 🚨 Audio alarm speelt (3x beep)
3. 📝 Incident wordt aangemaakt
4. 💾 Incident opgeslagen in database (als Supabase)
5. 🔔 Banner verschijnt bovenaan
6. ⚠️ Rack kaart kleurt rood

### Bij Drempel Verhogen:

**Als critical: 35°C → 40°C**
- Rack met 36°C: Rood → Oranje
- Alarm stopt
- Banner verdwijnt (als dismiss)
- Incident blijft in logboek

### Bij Drempel Verlagen:

**Als critical: 35°C → 30°C**
- Rack met 31°C: Oranje → Rood
- 🚨 Nieuw alarm!
- Nieuw incident
- Nieuwe banner

## 📋 Best Practices

### Data Center Standaarden:

**ASHRAE Aanbevelingen:**
- Ideaal: 18-27°C
- Maximaal: 32°C
- Kritiek: > 35°C

**Jouw Settings (voor productie):**
- Waarschuwing: 28°C ✅
- Kritiek: 35°C ✅

### Voor Testen:

**Veel alarms zien:**
- Waarschuwing: 20°C
- Kritiek: 25°C

**Geen alarms (rustig testen):**
- Waarschuwing: 35°C
- Kritiek: 45°C

### Voor Demo:

**Realistische maar actieve monitoring:**
- Waarschuwing: 26°C
- Kritiek: 32°C

## 🔍 Verificatie

### Check of Settings Werken:

1. **Open Dashboard**
2. **Noteer huidige rack status** (bijv. Rack B = 29.2°C, oranje)
3. **Open Settings**
4. **Verander waarschuwing naar 30°C**
5. **Ga terug naar Dashboard**
6. **Check Rack B**: Moet nu groen zijn! ✅

### Console Check:

**Open browser console (F12)**

```javascript
// Check huidige settings
localStorage.getItem('iot-dashboard-settings')

// Zou moeten tonen:
// {"warnTemp":28,"criticalTemp":35,...}
```

## 🎯 Samenvatting

**Vraag:** Als ik de temperatuur drempelwaarde verander, werkt het dan ook gelijk?

**Antwoord:** ✅ **JA!**

- Settings worden **real-time** gebruikt
- **Geen reload** nodig
- **Direct effect** zichtbaar
- **Automatisch** toegepast op alle racks
- **Opgeslagen** in browser/database

**Probeer het zelf:**
1. Ga naar Settings (⚙️)
2. Sleep een slider
3. Ga naar Dashboard
4. Zie het effect direct! ⚡

---

**Status**: ✅ Temperatuur drempelwaarden zijn volledig dynamisch en werken direct!

