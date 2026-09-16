# 📸 Serverruimte Foto Installatie

## Stap 1: Foto Opslaan

1. Sla de serverruimte foto op als: `serverroom.jpg`
2. Plaats het bestand in de `public` folder van je project:
   ```
   c:\Users\gorya\IoT-Dashboard-1\public\serverroom.jpg
   ```

## Stap 2: Klaar!

De code is al aangepast om jouw foto te gebruiken. Na het plaatsen van de foto zal deze automatisch worden gebruikt voor:

- ✅ Camera feed in de CameraView component
- ✅ Bewegingsdetectie preview foto's in het incident logboek

## Verificatie

Na het plaatsen van de foto:
1. Start/herstart de development server: `npm run dev`
2. Bekijk het dashboard
3. De camera feed moet nu jouw serverruimte foto tonen

## Bestandslocatie

```
IoT-Dashboard-1/
├── public/
│   ├── serverroom.jpg  ← JE FOTO HIER
│   └── vite.svg
├── src/
└── ...
```

## Backup Optie

Als je meerdere foto's wilt gebruiken voor variatie in het incident logboek, voeg deze toe als:
- `public/serverroom.jpg` (hoofdfoto)
- `public/serverroom-2.jpg` (optioneel)
- `public/serverroom-3.jpg` (optioneel)
- `public/serverroom-4.jpg` (optioneel)

De code zal dan alle beschikbare foto's roteren.
