import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "./db.js";
import { config } from "./config.js";

export const authRouter = express.Router();

const COOKIE_NAME = "iot_session";
const BCRYPT_ROUNDS = 12;

// Kolommen die we naar de client mogen sturen. Nooit password_hash.
const PUBLIC_COLUMNS = "id, username, created_at, last_login";

/**
 * Zet het sessiecookie.
 *
 * httpOnly  : JavaScript kan er niet bij, dus XSS kan het token niet stelen.
 * sameSite  : beschermt tegen CSRF vanaf andere sites.
 * secure    : alleen via HTTPS. Staat uit als de VM nog op plain HTTP draait,
 *             anders zou inloggen onmogelijk zijn. Zet COOKIE_SECURE=true
 *             zodra je een certificaat hebt.
 */
function setSessionCookie(res, user, remember) {
  const maxAgeMs = remember
    ? config.session.rememberDays * 24 * 60 * 60 * 1000
    : config.session.shortHours * 60 * 60 * 1000;

  const token = jwt.sign(
    { sub: user.id, username: user.username },
    config.jwtSecret,
    { expiresIn: Math.floor(maxAgeMs / 1000) }
  );

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    maxAge: maxAgeMs,
    path: "/",
  });
}

function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

function toPublicUser(row) {
  return {
    id: row.id,
    username: row.username,
    createdAt: row.created_at,
    lastLogin: row.last_login,
  };
}

/** Haal een gebruiker op zonder de wachtwoordhash. */
async function findUserById(id) {
  const rows = await query(
    `SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = ?`,
    [id]
  );
  return rows[0] ?? null;
}

/**
 * Middleware: blokkeert de request als er geen geldige sessie is.
 */
export function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ error: "Niet ingelogd." });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = { id: payload.sub, username: payload.username };
    next();
  } catch {
    clearSessionCookie(res);
    return res.status(401).json({ error: "Sessie ongeldig of verlopen." });
  }
}

function validateCredentials(username, password) {
  if (typeof username !== "string" || typeof password !== "string") {
    return "Gebruikersnaam en wachtwoord zijn verplicht.";
  }

  const trimmed = username.trim();

  if (trimmed.length < 3) {
    return "Gebruikersnaam moet minimaal 3 tekens bevatten.";
  }
  if (trimmed.length > 64) {
    return "Gebruikersnaam mag maximaal 64 tekens bevatten.";
  }
  if (!/^[a-z0-9_.-]+$/i.test(trimmed)) {
    return "Gebruikersnaam mag alleen letters, cijfers, punt, streepje en underscore bevatten.";
  }
  if (password.length < 8) {
    return "Wachtwoord moet minimaal 8 tekens bevatten.";
  }
  if (password.length > 200) {
    return "Wachtwoord is te lang.";
  }

  return null;
}

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------
authRouter.post("/register", async (req, res, next) => {
  try {
    const { username, password, remember = false } = req.body ?? {};

    const validationError = validateCredentials(username, password);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const normalized = username.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    let insertId;
    try {
      const result = await query(
        `INSERT INTO users (username, password_hash) VALUES (?, ?)`,
        [normalized, passwordHash]
      );
      insertId = result.insertId;
    } catch (err) {
      // 1062 = ER_DUP_ENTRY (unieke index op username)
      if (err.errno === 1062 || err.code === "ER_DUP_ENTRY") {
        return res
          .status(409)
          .json({ error: "Deze gebruikersnaam is al in gebruik." });
      }
      throw err;
    }

    // Meteen inloggen: last_login vullen en cookie zetten.
    // MariaDB kent geen UPDATE ... RETURNING, dus we lezen de rij daarna terug.
    await query("UPDATE users SET last_login = NOW() WHERE id = ?", [insertId]);

    const row = await findUserById(insertId);
    const user = toPublicUser(row);
    setSessionCookie(res, user, Boolean(remember));

    console.log(`✨ Nieuw account aangemaakt: ${user.username}`);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
authRouter.post("/login", async (req, res, next) => {
  try {
    const { username, password, remember = false } = req.body ?? {};

    if (typeof username !== "string" || typeof password !== "string") {
      return res
        .status(400)
        .json({ error: "Gebruikersnaam en wachtwoord zijn verplicht." });
    }

    const normalized = username.trim().toLowerCase();

    const rows = await query(
      `SELECT id, username, password_hash FROM users WHERE username = ?`,
      [normalized]
    );

    const row = rows[0];

    // Onbekende gebruiker: toch een hash vergelijken, zodat de responstijd
    // niet verraadt of het account bestaat.
    if (!row) {
      await bcrypt.compare(
        password,
        "$2a$12$abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRS"
      );
      return res
        .status(401)
        .json({ error: "Onjuiste gebruikersnaam of wachtwoord." });
    }

    const valid = await bcrypt.compare(password, row.password_hash);
    if (!valid) {
      return res
        .status(401)
        .json({ error: "Onjuiste gebruikersnaam of wachtwoord." });
    }

    await query("UPDATE users SET last_login = NOW() WHERE id = ?", [row.id]);

    const fresh = await findUserById(row.id);
    const user = toPublicUser(fresh);
    setSessionCookie(res, user, Boolean(remember));

    console.log(`🔓 Ingelogd: ${user.username}`);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/logout
// ---------------------------------------------------------------------------
authRouter.post("/logout", (req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// GET /api/auth/me
//   Gebruikt door de frontend om bij het opstarten te bepalen of er nog een
//   geldige sessie is.
// ---------------------------------------------------------------------------
authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const row = await findUserById(req.user.id);

    if (!row) {
      clearSessionCookie(res);
      return res.status(401).json({ error: "Account bestaat niet meer." });
    }

    res.json({ user: toPublicUser(row) });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/auth/exists
//   Of er al minstens een account bestaat. Zo kan het inlogscherm bij een
//   verse installatie direct de registratie-tab tonen.
// ---------------------------------------------------------------------------
authRouter.get("/exists", async (_req, res, next) => {
  try {
    const rows = await query("SELECT 1 AS present FROM users LIMIT 1");
    res.json({ hasAccount: rows.length > 0 });
  } catch (err) {
    next(err);
  }
});
