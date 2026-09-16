# 🔄 Vervang Serverruimte Foto

## Huidige Situatie

Er staat momenteel een placeholder foto in `public/serverroom.jpg` (133 KB).
Deze moet je vervangen met jouw eigen serverruimte foto die je hebt geüpload.

## Stappen Om Te Vervangen

### Optie 1: Via File Explorer (Makkelijkst)

1. **Open de public folder**:
   ```
   c:\Users\gorya\IoT-Dashboard-1\public\
   ```

2. **Verwijder de huidige foto** (optioneel):
   - `serverroom.jpg` (de oude placeholder)

3. **Plaats jouw foto**:
   - Sla je geüploade serverruimte foto op
   - Hernoem het naar: `serverroom.jpg`
   - Sleep het naar de public folder
   - Of kopieer/plak het daar

4. **Klaar!** De foto wordt automatisch gebruikt

### Optie 2: Via PowerShell

```powershell
# Ga naar de public folder
cd c:\Users\gorya\IoT-Dashboard-1\public

# Verwijder oude foto
Remove-Item serverroom.jpg

# Kopieer je nieuwe foto (pas het pad aan naar waar jouw foto staat)
Copy-Item "C:\Users\gorya\Downloads\jouw-serverruimte-foto.jpg" -Destination "serverroom.jpg"
```

## ✅ Verificatie

Na het vervangen van de foto:

1. **Start de dev server** (of herstart als deze al draait):
   ```powershell
   npm run dev
   ```

2. **Open het dashboard** in je browser (meestal http://localhost:5173)

3. **Check de camera feed**:
   - Ga naar het dashboard
   - Scroll naar "Visuele Monitoring"
   - De camera feed moet nu JOUW serverruimte foto tonen met:
     - Witte server racks
     - Gele kabelmanagement
     - Blauwe LED verlichting
     - Zwart plafond

4. **Wacht op automatische bewegingsdetectie**:
   - Beweging wordt automatisch gedetecteerd (45-90 seconden)
   - Check het incident logboek
   - De foto moet daar verschijnen bij bewegingsdetectie events

## 📸 Foto Specificaties

### Optimale Settings:
- **Formaat**: JPG of PNG
- **Breedte**: 800-1920px (breder is beter)
- **Hoogte**: 600-1080px
- **Bestandsgrootte**: < 2MB (voor snelle laadtijd)
- **Aspect Ratio**: 16:9 of 4:3 werkt het beste

### Jouw Foto Kenmerken:
✓ Serverruimte met witte racks
✓ Geel kabelmanagement systeem aan plafond
✓ Blauwe LED strips voor sfeerverlichting
✓ Professionele datacenter uitstraling
✓ Duidelijk zicht op meerdere racks

## 🎨 Hoe Het Eruit Ziet

```
┌────────────────────────────────────────────────┐
│ 📷 Bewegingsdetectie Camera    🔴 LIVE        │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │                                          │   │
│ │   [JOUW SERVERRUIMTE FOTO HIER]         │   │
│ │                                          │   │
│ │   - Witte racks zichtbaar               │   │
│ │   - Gele kabels aan plafond             │   │
│ │   - Blauwe LED verlichting              │   │
│ │                                          │   │
│ │ CAM-01 · Serverruimte Noord  14:32:15   │   │
│ └─────────────────────────────────────────┘   │
└────────────────────────────────────────────────┘
```

## ⚠️ Troubleshooting

### Foto laadt niet / toont niet
1. Check of de bestandsnaam exact is: `serverroom.jpg` (lowercase!)
2. Check of de foto in de juiste folder staat: `public/`
3. Herstart de dev server: Stop (Ctrl+C) en run `npm run dev` opnieuw
4. Hard refresh in browser: Ctrl+F5

### Foto is wazig of te klein
- Gebruik een hogere resolutie versie van je foto
- Minimaal 800px breed voor goede kwaliteit

### Foto toont verkeerde oriëntatie
- Roteer de foto voordat je deze plaatst
- Gebruik een foto editor (Paint, Photos app, etc.)

## 🔄 Meerdere Foto's (Optioneel)

Voor variatie in het incident logboek, voeg meerdere foto's toe:

```
public/
├── serverroom.jpg      ← Hoofdfoto (verplicht)
├── serverroom-2.jpg    ← Optioneel (andere hoek)
├── serverroom-3.jpg    ← Optioneel (andere rack)
└── serverroom-4.jpg    ← Optioneel (close-up)
```

Update dan `src/utils/simulation.ts`:
```typescript
export const samplePhotos = [
  "/serverroom.jpg",
  "/serverroom-2.jpg",
  "/serverroom-3.jpg",
  "/serverroom-4.jpg",
];
```

---

## 🎯 Quick Action

**Snelste manier:**
1. Open File Explorer
2. Navigeer naar: `c:\Users\gorya\IoT-Dashboard-1\public\`
3. Sleep jouw serverruimte foto naar deze folder
4. Hernoem het naar: `serverroom.jpg`
5. Herstart dev server
6. Done! ✅

**De foto die je net hebt geüpload in de chat, die moet hier komen! 📸**

