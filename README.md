# IoT Dashboard - Server Room Monitoring System

Real-time monitoring van serverruimte temperatuur, luchtvochtigheid en
beveiligingsincidenten. React frontend, Node API en MariaDB, alles in Docker.

![Status](https://img.shields.io/badge/Status-Werkend-success)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![MariaDB](https://img.shields.io/badge/MariaDB-11-003545)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ed)

## 🏗️ Architectuur

```
Browser
   │  HTTP
   ▼
┌─────────────────────┐
│  web (nginx)        │  poort 3002, het enige dat publiek open staat
│  - React build      │
│  - proxy /api  ─────┼──┐
└─────────────────────┘  │  intern Docker netwerk
                         ▼
                  ┌──────────────────┐
                  │  api (Node)      │  niet publiek
                  │  - auth (bcrypt) │
                  │  - REST API      │
                  │  - simulator     │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │  db (MariaDB 11) │  niet publiek
                  │  4 tabellen      │
                  └──────────────────┘
```

**Waarom een API-laag?** Een browser kan niet direct met MariaDB praten; dat
gebruikt een eigen TCP-protocol, geen HTTP. De API is dus geen extra luxe maar
noodzakelijk. Het is ook de plek waar wachtwoorden veilig worden gehasht.

Omdat nginx `/api` doorstuurt, draaien frontend en API op dezelfde origin. Dat
betekent geen CORS-configuratie, en het sessiecookie gaat automatisch mee.

## 🗄️ Database

Vier tabellen. Het schema staat in `server/src/schema.sql` en wordt bij elke
start van de API uitgevoerd (idempotent, dus veilig bij herstarten).

| Tabel | Kolommen | Bijzonderheden |
|---|---|---|
| `users` | `id`, `username`, `password_hash`, `created_at`, `last_login` | bcrypt hash, geen rollen |
| `settings` | `id`, `rack_id`, `temp_threshold_high`, `temp_threshold_low`, `humidity_threshold`, `updated_at` | **gedeeld**: één rij per rack |
| `sensor_data` | `id`, `rack_id`, `timestamp`, `temperature`, `humidity` | **max 500 records** |
| `incidents` | `id`, `timestamp`, `type`, `image_path`, `description` | `type` ∈ beweging, geluid, temperatuur |

### Gedeelde instellingen

`settings` heeft één rij per rack, niet één per gebruiker. Past iemand een
drempelwaarde aan, dan zien alle andere apparaten die binnen 10 seconden
(de frontend pollt). Dat is precies het gedrag dat gevraagd was: wijzigt één
iemand iets, dan verandert het overal.

### Maximaal 500 sensor logs

Na elke insert ruimt de API de oudste metingen op (`enforceSensorLimit()` in
`server/src/db.js`). Het zoekt het id van de 500e nieuwste meting en gooit
alles wat ouder is weg:

```sql
SELECT id FROM sensor_data ORDER BY id DESC LIMIT 1 OFFSET 499;
DELETE FROM sensor_data WHERE id < ?;
```

Omdat `id` AUTO_INCREMENT is, loopt de id-volgorde gelijk met de tijd. Het is
dus een indexscan op de primary key: goedkoop, ook bij elke meting.

**Waarom niet met een trigger?** MariaDB staat niet toe dat een trigger de
tabel muteert waarop hij zelf staat — dat geeft fout 1442 (`Can't update table
'sensor_data' in stored function/trigger`). In PostgreSQL kon dat wel. De
opruiming zit daarom in de API. Alle schrijfwegen lopen via de API (de
simulator en `POST /api/sensors`), dus de limiet wordt altijd toegepast.

Gebruik voor nieuwe metingen altijd `insertSensorReading()` uit `db.js`, dan
kan het opruimen niet per ongeluk worden overgeslagen.

Die 500 geldt voor de **hele tabel**, niet per rack. Met drie racks die elke
minuut meten is dat ongeveer 2,5 uur historie. Wil je meer, pas dan
`SENSOR_LOG_LIMIT` in `.env` aan; dat is de enige plek waar het getal staat.

## 🔐 Beveiliging

Dit is echte authenticatie, anders dan de eerdere localStorage-versie:

- Wachtwoorden worden **server-side** met bcrypt gehasht (12 rounds). De
  browser krijgt de hash nooit te zien.
- De sessie is een **httpOnly cookie** met een door de server ondertekende JWT.
  JavaScript kan er niet bij, dus een XSS-lek kan het token niet stelen, en de
  inhoud is niet te manipuleren.
- `sameSite=lax` beschermt tegen CSRF vanaf andere sites.
- Bij een onbekende gebruikersnaam wordt alsnog een bcrypt-vergelijking
  uitgevoerd, zodat de responstijd niet verraadt of een account bestaat.
- De foutmelding is altijd "Onjuiste gebruikersnaam of wachtwoord", nooit welke
  van de twee fout was.
- MariaDB en de API staan **niet** op het internet. Alleen nginx is bereikbaar.
- De API weigert te starten zonder `MARIADB_PASSWORD` en een `JWT_SECRET` van
  minimaal 32 tekens. Placeholders als "changeme" worden geweigerd.
- Het root-wachtwoord van MariaDB wordt willekeurig gegenereerd en nergens
  bewaard. De applicatiegebruiker heeft alleen rechten op zijn eigen database.

> ⚠️ Zet `COOKIE_SECURE=true` in `.env` zodra je HTTPS hebt. Zonder certificaat
> moet dit op `false`, anders stuurt de browser het cookie niet mee en kun je
> niet inloggen.

## 🚀 Deployen op de Ubuntu VM

### 1. Docker installeren

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable --now docker

# Zodat je docker zonder sudo kunt gebruiken (daarna uit- en inloggen)
sudo usermod -aG docker $USER
```

### 2. Project ophalen

```bash
git clone <jouw-repo-url> iot-dashboard
cd iot-dashboard
```

### 3. Secrets instellen

```bash
cp .env.example .env
```

Genereer twee sterke waarden:

```bash
echo "MARIADB_PASSWORD=$(openssl rand -base64 32)"
echo "JWT_SECRET=$(openssl rand -base64 48)"
```

Zet die in `.env`. Zonder deze twee start de API niet.

### 4. Starten

```bash
docker compose up --build -d
```

De eerste keer duurt dit een paar minuten. Daarna:

```bash
docker compose ps          # draaien alle drie de containers?
docker compose logs -f api # meekijken met de API
```

### 5. Openen

```
http://<ip-van-de-vm>:3002
```

Er is nog geen account, dus het inlogscherm opent op de registratie-tab. Maak
daar je eerste account aan.

### Firewall

```bash
sudo ufw allow 3002/tcp
sudo ufw enable
```

Open **niet** poort 3306 of 3000. Die zijn bewust alleen intern bereikbaar.

## 🧑‍💻 Lokaal ontwikkelen

Met Docker voor database en API, en Vite voor de frontend:

```bash
# Terminal 1: database + api
docker compose up db api

# Terminal 2: frontend met hot reload
npm install
npm run dev
```

Voeg in `vite.config.ts` een proxy toe zodat `/api` naar de container gaat:

```ts
server: {
  proxy: { '/api': 'http://localhost:3000' }
}
```

Publiceer dan wel tijdelijk poort 3000 van de `api` service in
`docker-compose.yml`.

Alternatief: gewoon `docker compose up --build` en testen op poort 3002.

## 🎯 Commando's

```bash
docker compose up --build -d     # bouwen en starten
docker compose down              # stoppen (database blijft bewaard)
docker compose down -v           # stoppen EN database wissen
docker compose logs -f api       # logs van de API
docker compose restart api       # alleen de API herstarten

npm run dev                      # frontend dev server
npm run build                    # productie build
npm run lint                     # ESLint
```

## 📡 API Endpoints

Alles onder `/api` behalve de auth-routes en health vereist een geldige sessie.

| Methode | Endpoint | Omschrijving |
|---|---|---|
| GET | `/api/health` | Status van API en database |
| POST | `/api/auth/register` | Account aanmaken en inloggen |
| POST | `/api/auth/login` | Inloggen |
| POST | `/api/auth/logout` | Uitloggen |
| GET | `/api/auth/me` | Huidige sessie opvragen |
| GET | `/api/auth/exists` | Bestaat er al een account? |
| GET | `/api/settings` | Alle drempelwaarden |
| PUT | `/api/settings/:rackId` | Drempelwaarden aanpassen |
| GET | `/api/sensors` | Metingen per rack |
| POST | `/api/sensors` | Meting vastleggen (voor echte sensoren) |
| GET | `/api/incidents?limit=50` | Incident logboek |
| POST | `/api/incidents` | Incident vastleggen |

## 🔌 Van simulatie naar echte sensoren

De simulator draait op de **server**, niet in de browser. Dat is bewust: zou
elke browser zelf simuleren, dan zag iedereen andere cijfers en zouden de
apparaten elkaars logs vervuilen.

Echte sensoren aansluiten:

1. Zet `SIMULATOR_ENABLED=false` in `.env` en herstart: `docker compose up -d`
2. Laat je hardware meten en POSTen:

```bash
curl -X POST http://<vm-ip>:3002/api/sensors \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"rackId": 1, "temperature": 24.5, "humidity": 45.2}'
```

Dit endpoint vereist een sessie. Voor een sensor zonder browser is een
API-token handiger; dat is nu nog niet ingebouwd.

## 📁 Project Structuur

```
IoT-Dashboard/
├── server/                      # Backend API
│   ├── src/
│   │   ├── index.js             # Express app + opstarten
│   │   ├── config.js            # Env validatie + rack basiswaarden
│   │   ├── db.js                # MariaDB pool + schema init + 500-logs limiet
│   │   ├── schema.sql           # De 4 tabellen
│   │   ├── auth.js              # Register/login/logout/me
│   │   ├── routes.js            # Settings, sensors, incidents
│   │   └── simulator.js         # Sensorsimulatie + incidents
│   ├── package.json
│   └── Dockerfile
├── src/                         # Frontend
│   ├── components/              # RackCard, IncidentList, Navigation, ...
│   ├── config/racks.ts          # Rack namen, locaties, apparaten
│   ├── hooks/
│   │   ├── useAuth.tsx          # Sessie via /api/auth/me
│   │   └── useSettings.ts       # Gedeelde drempelwaarden + polling
│   ├── pages/                   # Dashboard, Incidents, Settings, Login
│   ├── services/
│   │   ├── apiClient.ts         # Fetch wrapper
│   │   ├── authService.ts
│   │   ├── sensorService.ts
│   │   ├── settingsService.ts
│   │   └── incidentService.ts
│   ├── utils/
│   │   ├── simulation.ts        # Weergave-helpers + statuslogica
│   │   └── audio.ts             # Audio alerts
│   ├── types.ts
│   └── App.tsx                  # Auth gate + polling
├── docker-compose.yml           # db + api + web
├── Dockerfile                   # Frontend build
├── nginx.conf                   # Static serving + /api proxy
└── .env.example
```

## 📸 Serverruimte foto

De camerafeed gebruikt je eigen foto. Sla die op als `public/serverroom.jpg`.

## 🐛 Troubleshooting

**`MARIADB_PASSWORD ontbreekt in .env`** — je hebt `.env.example` niet
gekopieerd naar `.env`, of de waarden zijn leeg.

**API blijft herstarten** — bekijk `docker compose logs api`. Meestal een te
korte `JWT_SECRET` (minimaal 32 tekens) of de database was nog niet klaar. De
API probeert 30 keer opnieuw te verbinden, dus dat laatste lost zichzelf op.

**Inloggen lukt niet, geen foutmelding** — staat `COOKIE_SECURE=true` terwijl
je op HTTP zit? De browser stuurt het cookie dan niet mee. Zet het op `false`.

**"Geen verbinding met de server"** — de API container draait niet. Check
`docker compose ps` en `docker compose logs api`.

**Wijzigingen niet zichtbaar** — je draait de oude image. Gebruik
`docker compose up --build`.

**Grafieken leeg** — de simulator vult de database bij de eerste start. Kijk in
de API-logs of je "Historische metingen aangemaakt" ziet.

**Database bekijken**

```bash
docker compose exec db mariadb -u iot_user -p iot_dashboard
# Vul het MARIADB_PASSWORD uit je .env in

# Handige queries:
# SELECT COUNT(*) FROM sensor_data;        -- moet <= 500 zijn
# SELECT * FROM settings ORDER BY rack_id;
# SELECT username, last_login FROM users;
# SELECT type, COUNT(*) FROM incidents GROUP BY type;
# SHOW TABLES;
```

Of in één regel, zonder interactieve shell:

```bash
docker compose exec db mariadb -u iot_user -p"$(grep '^MARIADB_PASSWORD=' .env | cut -d= -f2-)" \
  iot_dashboard -e "SELECT COUNT(*) AS metingen FROM sensor_data;"
```

**Poort 3306 tijdelijk openzetten om te debuggen** — voeg toe aan de `db`
service in `docker-compose.yml`:

```yaml
ports:
  - "127.0.0.1:3306:3306"
```

Het `127.0.0.1:` voorvoegsel is belangrijk: daarmee is de database alleen vanaf
de VM zelf bereikbaar, niet vanaf het internet. Haal dit weg als je klaar bent.

## 📝 Licentie

MIT License - Vrij te gebruiken voor educatieve en commerciële doeleinden.
