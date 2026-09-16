# 🐳 Docker Update Guide - Nieuwe Code Deployen

## 📋 Probleem

Na het committen van nieuwe code naar Git, worden de wijzigingen niet automatisch doorgevoerd naar de draaiende Docker container.

## ✅ Oplossing: Rebuild & Restart

### Quick Method (Met Cache)
```bash
# Stop de container
docker-compose down

# Rebuild en start
docker-compose up -d --build
```

**⚠️ Let op**: Dit gebruikt cache en neemt mogelijk niet alle wijzigingen mee!

### Recommended Method (Clean Rebuild) ⭐

```bash
# 1. Stop de container
docker-compose down

# 2. Rebuild zonder cache (garantie dat alle wijzigingen mee zijn)
docker-compose build --no-cache

# 3. Start de container
docker-compose up -d
```

## 🔍 Verificatie

### Check of container draait
```bash
docker ps
```

Je zou moeten zien:
```
CONTAINER ID   IMAGE                           PORTS                    NAMES
2925526a7e30   iot-dashboard-1-iot-dashboard   0.0.0.0:3000->80/tcp    iot-dashboard
```

### Check container logs
```bash
docker logs iot-dashboard --tail 20
```

Je zou nginx worker processes moeten zien starten.

### Test in browser
```
Open: http://localhost:3000
```

**Checklist:**
- [ ] Dashboard laadt correct
- [ ] Navigatie werkt (Dashboard / Incidenten / **Instellingen**)
- [ ] Settings pagina is zichtbaar
- [ ] Alle nieuwe features werken

## 🎯 Wanneer Rebuilden?

### Altijd rebuilden na:
- ✅ Nieuwe files toegevoegd (bijv. SettingsPage.tsx)
- ✅ Bestaande code gewijzigd
- ✅ Dependencies geüpdatet (package.json)
- ✅ Build configuratie aangepast (vite.config.ts)

### NIET nodig na:
- ❌ Alleen documentatie (.md files) gewijzigd
- ❌ Git commits zonder code changes
- ❌ .env bestand aangepast (wordt niet in Docker gekopieerd)

## 🔧 Advanced: Troubleshooting

### Container start niet
```bash
# Check logs voor errors
docker logs iot-dashboard

# Rebuild vanaf scratch
docker-compose down
docker system prune -f  # Wis oude images
docker-compose build --no-cache
docker-compose up -d
```

### Poort al in gebruik
```bash
# Check welk proces poort 3000 gebruikt
netstat -ano | findstr :3000

# Of verander de poort in docker-compose.yml:
ports:
  - "3001:80"  # Gebruik poort 3001 in plaats van 3000
```

### Oude versie blijft laden in browser
```
1. Hard refresh: Ctrl + Shift + R
2. Clear browser cache
3. Open incognito window
```

## 📊 Build Output Interpretatie

### Succesvolle Build
```
✓ 896 modules transformed.
✓ built in 5.06s
dist/assets/index-VoLPw7-H.js   600.23 kB │ gzip: 173.44 kB
```

**Indicators van nieuwe code:**
- Module count verhoogd (was 850 → nu 896)
- Bundle hash veranderd (VoLPw7-H is nieuw)
- Build size veranderd

### Build Warnings (OK om te negeren)
```
npm warn EBADENGINE Unsupported engine
(!) Some chunks are larger than 500 kB
```

**Dit zijn waarschuwingen, geen errors!**

## 🎨 One-Liner Commands

```bash
# Complete rebuild + start
docker-compose down && docker-compose build --no-cache && docker-compose up -d

# Quick rebuild (met cache)
docker-compose down && docker-compose up -d --build

# Stop + start (geen rebuild)
docker-compose restart

# Check status
docker ps | findstr iot-dashboard
```

## 💡 Best Practices

### 1. Altijd Clean Rebuild voor Productie
```bash
# Voor deployment of belangrijke updates:
docker-compose build --no-cache
```

### 2. Test Lokaal Eerst
```bash
# Test met npm run dev voordat je Docker rebuild:
npm run dev

# Open http://localhost:5173
# Verificeer dat alles werkt
# Dan pas Docker rebuilden
```

### 3. Git Workflow
```bash
# 1. Maak wijzigingen in code
# 2. Test lokaal: npm run dev
# 3. Commit naar Git
git add .
git commit -m "Added Settings page with Supabase sync"

# 4. Rebuild Docker
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 5. Test Docker versie: http://localhost:3000
```

## 🔄 Update Checklist

Gebruik deze checklist bij elke code update:

```
□ Code wijzigingen gemaakt
□ Lokaal getest met npm run dev
□ Git commit gemaakt
□ docker-compose down uitgevoerd
□ docker-compose build --no-cache uitgevoerd
□ docker-compose up -d uitgevoerd
□ docker ps gecontroleerd (container draait)
□ Browser test: http://localhost:3000
□ Nieuwe features werken correct
□ Geen console errors (F12)
```

## 📦 Wat Gebeurt Er Bij Een Rebuild?

```
┌─────────────────────────────────────────┐
│ 1. docker-compose down                  │
│    → Stop & verwijder containers        │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 2. docker-compose build --no-cache      │
│    → Pull Node 20 Alpine image          │
│    → Copy package.json                  │
│    → npm ci (install dependencies)      │
│    → Copy source code                   │
│    → npm run build (TypeScript + Vite)  │
│    → Copy dist/ naar Nginx              │
│    → Create Docker image                │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 3. docker-compose up -d                 │
│    → Create network                     │
│    → Start container (detached mode)    │
│    → Nginx serves app on port 3000     │
└─────────────────────────────────────────┘
```

## 🎉 Success Indicators

Je weet dat de update succesvol is als:

✅ `docker ps` toont "iot-dashboard" als "Up X seconds"  
✅ `docker logs iot-dashboard` toont "start worker processes"  
✅ Browser laadt app zonder errors  
✅ **Nieuwe features zijn zichtbaar** (bijv. Instellingen tab)  
✅ Console (F12) toont geen build errors  
✅ Bundle hash in index.html is veranderd  

## 🆘 Quick Fix Commands

```bash
# "Het werkt niet!" starter pack:
docker-compose down
docker system prune -f
docker-compose build --no-cache
docker-compose up -d
# Ctrl + Shift + R in browser
```

---

**Laatste Update**: Na toevoegen van Settings v2.0 met Supabase sync

**Container Info**:
- Image: `iot-dashboard-1-iot-dashboard`
- Port: `http://localhost:3000`
- Base: Node 20 Alpine + Nginx Alpine

🚀 **Nu heb je altijd de laatste versie in Docker!**
