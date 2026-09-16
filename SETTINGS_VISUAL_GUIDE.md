# ⚙️ Instellingen Pagina - Visuele Gids

## 🎨 Pagina Layout

```
┌─────────────────────────────────────────────────────────────┐
│  🏠 Dashboard  │  📋 Incidenten  │  ⚙️ Instellingen        │ ← Navigatie
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🚨 KRITIEKE TEMPERATUUR BANNER (indien actief)             │
│     Rack B kritieke temperatuur                [Dismiss]    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ⚙️  Instellingen                                           │
│     Pas het dashboard aan naar jouw voorkeuren              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ✅ Instellingen succesvol opgeslagen! (na opslaan)         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🌡️  Temperatuur Drempelwaarden                            │
│                                                              │
│  Waarschuwingstemperatuur                        28°C       │
│  ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━○             │
│  20°C ←                                      → 40°C         │
│  Bij deze temperatuur wordt een oranje waarschuwing getoond │
│                                                              │
│  Kritieke temperatuur                            35°C       │
│  ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━○            │
│  25°C ←                                      → 45°C         │
│  Bij deze temperatuur wordt een rode kritieke alert...      │
│                                                              │
│  ℹ️  Let op: Zorg dat de kritieke temperatuur hoger is...  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🔊  Audio Instellingen                                     │
│                                                              │
│  Audio Alerts                                    [●─────]   │ ← ON
│  Geluid afspelen bij kritieke temperatuur                   │
│                                                              │
│  Alarm Volume                                      15%      │
│  ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━○             │
│                                                              │
│  Notificatie Geluiden                            [●─────]   │ ← ON
│  Geluid bij bewegingsdetectie camera                        │
│                                                              │
│  Notificatie Volume                                10%      │
│  ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━○              │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │        🔔 Test Alarm Geluid                         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🎨  Display Instellingen                                   │
│                                                              │
│  Dark Mode                                       [─────●]   │ ← ON
│  Donker kleurenschema (standaard)                           │
│                                                              │
│  Sensor Update Interval                            60s      │
│  ┌─────┬─────┬─────┬─────┐                                 │
│  │ 5s  │ 30s │ 60s │ 5m  │  ← 60s selected (blauw)         │
│  └─────┴─────┴─────┴─────┘                                 │
│  Hoe vaak sensor data wordt vernieuwd (simulatie)           │
│                                                              │
│  Grafiek Datapunten                                60       │
│  ┌─────┬─────┬─────┐                                        │
│  │ 30  │ 60  │ 120 │  ← 60 selected (blauw)                │
│  └─────┴─────┴─────┘                                        │
│  Aantal historische datapunten in grafieken                 │
│                                                              │
│  Incident Geschiedenis                             20       │
│  ┌────┬────┬────┬─────┐                                    │
│  │ 10 │ 20 │ 50 │ 100 │  ← 20 selected (blauw)             │
│  └────┴────┴────┴─────┘                                    │
│  Maximum aantal incidents in het logboek                    │
│                                                              │
│  Kleurthema                                                 │
│  ┌──────┬────────┬───────┬─────┐                           │
│  │ blue │ purple │ green │ red │  ← blue selected           │
│  └──────┴────────┴───────┴─────┘                           │
│  Accent kleur voor het dashboard (experimenteel)            │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────┬──────────────────────────────┐
│  💾 Instellingen Opslaan     │  🔄 Reset naar Standaard    │
│  (Grote blauwe knop)         │  (Grijze knop)              │
└──────────────────────────────┴──────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  💡 Tip: Alle instellingen worden lokaal opgeslagen in...  │
│     Bij gebruik van Supabase database kunnen...             │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Interactieve Elementen

### Toggle Switches
```
AAN:  [─────●]  (Groen, toggle rechts)
UIT:  [●─────]  (Grijs, toggle links)
```

### Sliders (Temperatuur & Volume)
```
●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━○
↑                                            ↑
Min waarde                              Max waarde

Sleep de cirkel om waarde aan te passen
```

### Button Grid (Interval, Datapunten, etc.)
```
┌─────┬─────┬─────┬─────┐
│ 5s  │ 30s │ 60s │ 5m  │
└─────┴─────┴─────┴─────┘
 Grijs  Grijs BLAUW Grijs   ← Geselecteerde knop is blauw
```

### Test Alarm Knop
```
┌─────────────────────────────────────┐
│   🔔 Test Alarm Geluid              │  ← Normaal (grijs bg)
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   🔔 Test Alarm Geluid              │  ← Hover (donkerder)
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   🔇 Test Alarm Geluid              │  ← Disabled (uitgegrijsd)
└─────────────────────────────────────┘
(Disabled als Audio Alerts uit staat)
```

### Opslaan Knoppen
```
┌──────────────────────────────┐
│  💾 Instellingen Opslaan    │  ← Idle (blauw)
└──────────────────────────────┘

┌──────────────────────────────┐
│  ⏳ Opslaan...              │  ← Saving (spinner animatie)
└──────────────────────────────┘

┌──────────────────────────────┐
│  ✅ Opgeslagen!             │  ← Saved (2 sec, dan terug)
└──────────────────────────────┘
```

### Reset Knop States
```
┌──────────────────────────────┐
│  🔄 Reset naar Standaard    │  ← Normaal (grijs)
└──────────────────────────────┘

┌──────────────────────────────┐
│  ⚠️ Bevestig Reset          │  ← Confirm state (rood, 3 sec)
└──────────────────────────────┘
(Klik 2x om te resetten)
```

## 📱 Responsive Gedrag

### Desktop (>1024px)
- Volledige breedte met max 5xl container
- Alle secties onder elkaar
- Geen horizontale scroll

### Tablet (768px - 1024px)
- Iets smallere padding
- Button grids blijven intact
- Navigatie horizontal

### Mobile (<768px)
- Navigatie wordt compact
- Sliders blijven werkbaar
- Button grids stack indien nodig
- Touch-friendly targets (44x44px minimum)

## 🎨 Kleurenschema

### Primaire Kleuren
```
Achtergrond:         slate-950  (#020617)
Cards:               slate-800/40 met border slate-700/50
Tekst primair:       slate-100  (#f1f5f9)
Tekst secundair:     slate-400  (#94a3b8)
```

### Status Kleuren
```
Info:    blue-500   (#3b82f6)  ℹ️ Tips en info boxes
Succes:  green-600  (#16a34a)  ✅ Opgeslagen bevestiging
Waarsch: orange-500 (#f97316)  🌡️ Temperatuur waarschuwing
Kritiek: red-600    (#dc2626)  🚨 Alarm en kritieke status
```

### Interactieve Elementen
```
Toggle ON:   green-600  (#16a34a)
Toggle OFF:  slate-600  (#475569)
Selected:    blue-600   (#2563eb)
Hover:       slate-600/700 (afhankelijk van context)
```

## 🔔 Feedback Mechanismen

### 1. Visuele Feedback bij Opslaan
```
1. User klikt "Instellingen Opslaan"
2. Knop tekst: "💾 Instellingen Opslaan" → "⏳ Opslaan..."
3. Na 500ms: Knop tekst → "✅ Opgeslagen!"
4. Groene banner verschijnt boven pagina
5. Na 2 seconden: Banner verdwijnt, knop terug naar normaal
```

### 2. Real-time Preview
```
- Sleep temperatuur slider → Status dots updaten live
- Pas volume aan → Test Alarm knop om te horen
- Verander interval → Console toont nieuwe polling rate
```

### 3. Validatie
```
- Kritieke temp < Waarschuwing? → Blauwe info box toont waarschuwing
- Audio disabled? → Test Alarm knop wordt grayed out
- Settings invalid? → Save knop wordt disabled (toekomstig)
```

## 💡 UX Tips voor Gebruikers

1. **Hover States**: Alle klikbare elementen highlighten bij hover
2. **Focus States**: Keyboard navigatie wordt ondersteund
3. **Animaties**: Smooth transitions op alle state changes
4. **Loading States**: Spinner animatie tijdens opslaan
5. **Confirmation**: Dubbele bevestiging voor destructieve acties (reset)
6. **Tooltips**: (Toekomstig) Hover hints op complexe settings

## 🎭 State Management Visualisatie

```
┌────────────────────────────────────────────────┐
│  User interactie (slider, toggle, button)     │
└─────────────────┬──────────────────────────────┘
                  ↓
┌────────────────────────────────────────────────┐
│  updateSetting() in useSettings hook           │
└─────────────────┬──────────────────────────────┘
                  ↓
┌────────────────────────────────────────────────┐
│  State update in React                         │
└─────────────────┬──────────────────────────────┘
                  ↓
┌────────────────────────────────────────────────┐
│  useEffect → localStorage.setItem()            │
└─────────────────┬──────────────────────────────┘
                  ↓
┌────────────────────────────────────────────────┐
│  Settings gepersisteerd in browser             │
└────────────────────────────────────────────────┘
```

## 📐 Layout Afmetingen

```
Container:           max-w-5xl (1280px)
Card padding:        p-6 (24px)
Slider height:       h-2 (8px)
Button height:       py-3/py-4 (12px-16px)
Toggle size:         w-14 h-8 (56px x 32px)
Section spacing:     space-y-6 (24px tussen secties)
```

---

**Deze visuele gids helpt bij het begrijpen van de layout en interacties!** 🎨
