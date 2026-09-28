import express from "express";
import cookieParser from "cookie-parser";
import { config } from "./config.js";
import { initDatabase, closeDatabase, query } from "./db.js";
import { authRouter } from "./auth.js";
import { apiRouter } from "./routes.js";
import { startSimulator, stopSimulator } from "./simulator.js";

const app = express();

// Nginx zit ervoor; vertrouw de X-Forwarded-* headers zodat `secure` cookies
// en IP-logging correct werken.
app.set("trust proxy", 1);

// Geen "X-Powered-By: Express" prijsgeven.
app.disable("x-powered-by");

app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

// Eenvoudige request logging.
app.use((req, _res, next) => {
  if (req.path !== "/api/health") {
    console.log(`${req.method} ${req.path}`);
  }
  next();
});

// ---------------------------------------------------------------------------
// Health check (geen auth nodig, gebruikt door Docker)
// ---------------------------------------------------------------------------
app.get("/api/health", async (_req, res) => {
  try {
    await query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (err) {
    res.status(503).json({ status: "error", database: err.message });
  }
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use("/api/auth", authRouter);
app.use("/api", apiRouter);

// Onbekende API route
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Onbekend endpoint." });
});

// ---------------------------------------------------------------------------
// Foutafhandeling
// ---------------------------------------------------------------------------
app.use((err, _req, res, _next) => {
  console.error("❌ Onverwachte fout:", err);

  // Geen interne details naar de client sturen.
  res.status(500).json({ error: "Er ging iets mis op de server." });
});

// ---------------------------------------------------------------------------
// Opstarten
// ---------------------------------------------------------------------------
async function start() {
  try {
    await initDatabase();
    await startSimulator();

    const server = app.listen(config.port, () => {
      console.log(`\n🚀 API draait op poort ${config.port}\n`);
    });

    // Netjes afsluiten bij docker stop / Ctrl+C.
    const shutdown = async (signal) => {
      console.log(`\n${signal} ontvangen, afsluiten...`);
      stopSimulator();
      server.close();
      await closeDatabase();
      process.exit(0);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (err) {
    console.error("\n❌ Kon de server niet starten:", err.message, "\n");
    process.exit(1);
  }
}

start();
