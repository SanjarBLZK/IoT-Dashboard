# 📷 Camera Feature - Visuele Gids

## Dashboard Layout Met Camera

```
┌─────────────────────────────────────────────────────────────────┐
│  IoT Dashboard - Server Room Monitoring                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  🎯 Server Racks                                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                         │
│  │ Rack A  │  │ Rack B  │  │ Rack C  │                         │
│  │ 🟢 24.5°C│  │ 🟠 29.2°C│  │ 🟢 26.8°C│                         │
│  └─────────┘  └─────────┘  └─────────┘                         │
│                                                                   │
│  📷 Visuele Monitoring                                           │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 📷 Bewegingsdetectie Camera        🔴 LIVE                   ││
│  │ Serverruimte monitoring                                      ││
│  │                                                               ││
│  │ ┌───────────────────────────────────────────────────────┐   ││
│  │ │                                                         │   ││
│  │ │         [SERVERRUIMTE FOTO - LIVE FEED]                │   ││
│  │ │                                                         │   ││
│  │ │         Server racks met blauwe LED verlichting        │   ││
│  │ │         Witte server kasten, gele kabelmanagement      │   ││
│  │ │                                                         │   ││
│  │ │  CAM-01 · Serverruimte Noord            14:32:15       │   ││
│  │ └───────────────────────────────────────────────────────┘   ││
│  │                                                               ││
│  │  ┌─────────┐  ┌─────────┐                                   ││
│  │  │ Status  │  │Resolutie│                                   ││
│  │  │🟢 Actief│  │1920×1080│                                   ││
│  │  └─────────┘  └─────────┘                                   ││
│  │                                                               ││
│  │  ℹ️ Camera functioneel: Bij bewegingsdetectie wordt         ││
│  │     automatisch een foto gemaakt en opgeslagen in het        ││
│  │     incidentenlogboek. Camera hoeft niet per se een         ││
│  │     high-end professionele camera te zijn.                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                   │
│  📊 Temperatuurvergelijking                                      │
│  [Grafiek met 3 lijnen: Rack A, B, C]                           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Bij Bewegingsdetectie

```
┌─────────────────────────────────────────────────────────────────┐
│  📷 Bewegingsdetectie Camera        🔴 LIVE                      │
│  Serverruimte monitoring                                         │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ ╔════════════════════════════════════════════════════════╗│  │
│  │ ║  🚨 BEWEGING GEDETECTEERD                              ║│  │
│  │ ╚════════════════════════════════════════════════════════╝│  │
│  │ ║                                                         ║│  │
│  │ ║       [SERVERRUIMTE FOTO - RODE OVERLAY]               ║│  │
│  │ ║                                                         ║│  │
│  │ ║       << Rode transparante overlay over foto >>        ║│  │
│  │ ║       << Pulserende rode border >>                     ║│  │
│  │ ║                                                         ║│  │
│  │ ║  CAM-01 · Serverruimte Noord            14:32:15       ║│  │
│  │ ╚════════════════════════════════════════════════════════╝│  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Status: 🟢 Actief  │  Laatste detectie: 14:32:15               │
└─────────────────────────────────────────────────────────────────┘
```

## Incident Logboek Met Foto

```
┌─────────────────────────────────────────────────────────────────┐
│  🕐 Recente Incidenten                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  📷  BEWEGING GEDETECTEERD                              │    │
│  │                                                          │    │
│  │      Beweging gedetecteerd: Noordzijde serverruimte    │    │
│  │      Foto automatisch opgeslagen                       │    │
│  │                                                          │    │
│  │      16-09-2026 14:32:15                [FOTO ↗]       │    │
│  │                                         ┌──────┐        │    │
│  │                                         │Server│        │    │
│  │                                         │ruimte│        │    │
│  │                                         │ foto │        │    │
│  │                                         └──────┘        │    │
│  │                                    ← Klik om te vergroten│    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  🚨  ALARM                                 · Rack 2      │    │
│  │                                                          │    │
│  │      Kritieke temperatuur gedetecteerd in Rack B        │    │
│  │                                                          │    │
│  │      16-09-2026 14:28:03                               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  📷  BEWEGING GEDETECTEERD                              │    │
│  │                                                          │    │
│  │      Beweging gedetecteerd: Centrale rij               │    │
│  │      Foto automatisch opgeslagen                       │    │
│  │                                                          │    │
│  │      16-09-2026 14:25:47                [FOTO ↗]       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Kleurcodes

### Camera Component:
- **Achtergrond**: Slate-800/40 (donkergrijs, transparant)
- **Border**: Slate-700/50 (medium grijs)
- **Live indicator**: Rood (#ef4444) met pulse animatie
- **Camera feed border**: Slate-700 (2px)
- **Motion overlay**: Rood 20% transparantie + rode border (#ef4444)
- **Info overlay**: Zwart gradient (van 80% naar transparant)

### Status Cards:
- **Achtergrond**: Slate-900/50 (heel donker grijs)
- **Actief status**: Groen (#22c55e)
- **Offline status**: Grijs (#64748b)
- **Text**: Slate-200 (licht grijs)
- **Labels**: Slate-400 (medium grijs)

### Test Button:
- **Achtergrond**: Amber-600 (#d97706)
- **Hover**: Amber-700 (#b45309)
- **Text**: Wit (#ffffff)

### Info Box:
- **Achtergrond**: Blauw 10% transparantie
- **Border**: Blauw 30% transparantie
- **Text**: Blauw-200 (licht blauw)
- **Icon**: Blauw-400 (medium blauw)

### Incident Types:
- **Motion**: Amber (#f59e0b) - 📷 emoji
- **Alarm**: Rood (#ef4444) - 🚨 emoji
- **Resolved**: Groen (#10b981) - ✅ emoji

## Animaties

### Pulserende Live Indicator:
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### Motion Detection Overlay:
```css
@keyframes pulse {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.4; }
}
```

### Foto Hover Effect:
```css
.hover\:scale-105:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease-in-out;
}
```

## Responsive Layout

### Desktop (lg: > 1024px):
```
[Rack A] [Rack B] [Rack C]
[    Camera Feed Full     ]
[    Comparison Chart     ]
```

### Tablet (md: 768px - 1024px):
```
[Rack A] [Rack B]
[    Rack C    ]
[  Camera Feed  ]
[Comparison Chart]
```

### Mobile (< 768px):
```
[  Rack A  ]
[  Rack B  ]
[  Rack C  ]
[Camera Feed]
[Comparison]
```

## Interactie Flow

```
USER ACTION                    SYSTEM RESPONSE
─────────────────────────────────────────────────────────────

[Pagina laden] ────────────►  Camera toont live feed
                              Status: 🟢 Actief

[45-90 sec wachten] ───────►  🚨 Beweging gedetecteerd!
                              └─► Rode overlay (2 sec)
                              └─► Foto kiezen uit pool
                              └─► Incident toevoegen
                              └─► Audio notificatie
                              └─► Update incident lijst

[Klik "Test" button] ──────►  🧪 Handmatige detectie
                              └─► Zelfde flow als automatisch

[Klik op foto] ────────────►  Foto opent in nieuw tabblad
                              (full size versie)

[Hover over foto] ─────────►  Foto zoom effect (scale 1.05)
```

## Camera Info Overlay Details

```
┌─────────────────────────────────────────────────┐
│                                                 │
│         [CAMERA FEED HIER]                      │
│                                                 │
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓ CAM-01 · Serverruimte Noord    14:32:15 ▓▓▓▓│
└─────────────────────────────────────────────────┘
   ▲                                            ▲
   └─ Camera ID & Locatie                  Timestamp
```

## Font Specificaties

- **Headers**: 2xl (1.5rem) - Semi-bold - Slate-100
- **Camera Title**: lg (1.125rem) - Semi-bold - Slate-100
- **Subtitles**: sm (0.875rem) - Regular - Slate-400
- **Live Indicator**: xs (0.75rem) - Medium - Red-400
- **Status Text**: sm (0.875rem) - Medium - Slate-200
- **Labels**: xs (0.75rem) - Regular - Slate-400
- **Button**: sm (0.875rem) - Medium - White
- **Camera Overlay**: xs (0.75rem) - Regular - White (mono)

---

**🎨 Design voltooid!** Alle visuele elementen zijn geïmplementeerd en klaar voor gebruik.

