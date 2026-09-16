# Docker Deployment Guide

## 📦 Bestanden

Dit project bevat de volgende Docker-gerelateerde bestanden:

- `Dockerfile` - Multi-stage build configuratie
- `nginx.conf` - Nginx webserver configuratie
- `docker-compose.yml` - Docker Compose orchestratie
- `.dockerignore` - Bestanden die uitgesloten worden van de Docker image

## 🚀 Gebruik

### Optie 1: Docker Compose (Aanbevolen)

```bash
# Build en start de container
docker-compose up -d

# Stop de container
docker-compose down

# Logs bekijken
docker-compose logs -f

# Rebuild na code wijzigingen
docker-compose up -d --build
```

De applicatie is beschikbaar op: **http://localhost:3000**

### Optie 2: Docker CLI

```bash
# Build de image
docker build -t iot-dashboard .

# Run de container
docker run -d -p 3000:80 --name iot-dashboard iot-dashboard

# Stop de container
docker stop iot-dashboard

# Remove de container
docker rm iot-dashboard

# Logs bekijken
docker logs -f iot-dashboard
```

## 🔧 Configuratie

### Poort aanpassen

Om een andere poort te gebruiken, pas `docker-compose.yml` aan:

```yaml
ports:
  - "8080:80"  # Externe poort:Interne poort
```

### Environment variabelen

Voeg environment variabelen toe in `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - API_URL=https://api.example.com
```

## 📊 Image Details

- **Base images**: 
  - Build: `node:20-alpine` (~40MB)
  - Production: `nginx:alpine` (~25MB)
- **Final image size**: ~30-40MB (geoptimaliseerd)
- **Multi-stage build**: Ja (build dependencies worden niet meegenomen)

## 🔒 Security Features

- Minimale Alpine Linux base image
- Security headers in Nginx (X-Frame-Options, X-Content-Type-Options, etc.)
- Gzip compressie enabled
- Static asset caching
- Non-root user in production

## 🛠️ Troubleshooting

### Container start niet

```bash
# Check logs
docker-compose logs

# Check of de poort al in gebruik is
netstat -an | findstr :3000
```

### Build errors

```bash
# Clean build zonder cache
docker-compose build --no-cache

# Of met Docker CLI
docker build --no-cache -t iot-dashboard .
```

### Permission errors (Linux/Mac)

```bash
# Als je permission errors krijgt
sudo docker-compose up -d
```

## 📝 Development vs Production

Voor development gebruik je `npm run dev` lokaal.
Voor production gebruik je deze Docker setup.

### Development (lokaal)

```bash
npm install
npm run dev
```

### Production (Docker)

```bash
docker-compose up -d
```

## 🔄 Updates

Na code wijzigingen:

```bash
# Stop huidige container
docker-compose down

# Rebuild en start
docker-compose up -d --build
```

## 🌐 Deployment

### Docker Hub

```bash
# Login
docker login

# Tag image
docker tag iot-dashboard username/iot-dashboard:latest

# Push naar Docker Hub
docker push username/iot-dashboard:latest
```

### Cloud deployment

Deze Docker setup werkt met alle cloud providers:
- AWS (ECS, Fargate, EC2)
- Azure (Container Instances, AKS)
- Google Cloud (Cloud Run, GKE)
- DigitalOcean (App Platform, Droplets)
- Heroku (Container Registry)

## 📈 Performance

- Gzip compressie: ~70% kleinere responses
- Static asset caching: 1 jaar
- Optimized Nginx configuratie
- Multi-stage build: kleinere image size
