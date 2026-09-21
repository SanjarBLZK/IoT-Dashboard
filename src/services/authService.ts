import { supabase, isSupabaseEnabled } from "../lib/supabaseClient";
import { AuthUser } from "../types";

/**
 * Auth service: praat met de `register_user` / `login_user` RPC functies.
 *
 * De wachtwoordverificatie gebeurt binnen Postgres (SECURITY DEFINER +
 * pgcrypto), zodat `password_hash` nooit naar de browser gaat.
 * Zie migrations/002_auth_functions.sql.
 *
 * SESSIEBEHEER
 * De sessie wordt client-side bewaard:
 *   - "Onthoud mij" aan  -> localStorage, 30 dagen geldig
 *   - "Onthoud mij" uit  -> sessionStorage, verdwijnt als de tab sluit
 * Dit is prototype-niveau: er is geen server-side getekend token. Voor een
 * productieomgeving hoort hier Supabase Auth (JWT) of een eigen backend.
 */

const SESSION_KEY = "iot-dashboard-session";
const REMEMBERED_USER_KEY = "iot-dashboard-remembered-username";

// Geldigheidsduur van een "onthoud mij" sessie.
const REMEMBER_ME_DAYS = 30;

interface StoredSession {
  userId: number;
  username: string;
  createdAt: string;
  lastLogin: string | null;
  expiresAt: string | null; // null = alleen geldig binnen deze tab-sessie
  remember: boolean;
}

// Ruwe rij zoals de RPC functies die teruggeven.
interface UserRow {
  id: number;
  username: string;
  created_at: string;
  last_login: string | null;
}

export interface AuthResult {
  user: AuthUser | null;
  error: string | null;
}

function rowToUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    username: row.username,
    createdAt: row.created_at,
    lastLogin: row.last_login,
  };
}

function sessionToUser(session: StoredSession): AuthUser {
  return {
    id: session.userId,
    username: session.username,
    createdAt: session.createdAt,
    lastLogin: session.lastLogin,
  };
}

/**
 * Vertaal database-fouten naar begrijpelijke Nederlandse meldingen.
 */
function translateError(message: string): string {
  const msg = message.toLowerCase();

  if (msg.includes("already in use") || msg.includes("al in gebruik")) {
    return "Deze gebruikersnaam is al in gebruik.";
  }
  if (msg.includes("could not find the function") || msg.includes("does not exist")) {
    return (
      "De database functies ontbreken. Run migrations/002_auth_functions.sql " +
      "in de Supabase SQL Editor."
    );
  }
  if (msg.includes("failed to fetch") || msg.includes("networkerror")) {
    return "Geen verbinding met de database. Check je internetverbinding.";
  }
  // Exceptions uit onze eigen functies zijn al Nederlands.
  return message;
}

export const authService = {
  /**
   * Log in met gebruikersnaam en wachtwoord.
   * Bij succes wordt de sessie opgeslagen en `last_login` in de database
   * bijgewerkt.
   */
  async login(
    username: string,
    password: string,
    remember: boolean
  ): Promise<AuthResult> {
    if (!isSupabaseEnabled()) {
      return {
        user: null,
        error:
          "Supabase is niet geconfigureerd. Zet VITE_SUPABASE_URL en " +
          "VITE_SUPABASE_ANON_KEY in je .env bestand.",
      };
    }

    try {
      const { data, error } = await supabase!.rpc("login_user", {
        p_username: username,
        p_password: password,
      });

      if (error) {
        return { user: null, error: translateError(error.message) };
      }

      const rows = (data ?? []) as UserRow[];

      // 0 rijen = ongeldige combinatie. We zeggen niet welke van de twee fout
      // is, zodat we geen bestaande gebruikersnamen verklappen.
      if (rows.length === 0) {
        return {
          user: null,
          error: "Onjuiste gebruikersnaam of wachtwoord.",
        };
      }

      const user = rowToUser(rows[0]);
      this.saveSession(user, remember);
      return { user, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { user: null, error: translateError(message) };
    }
  },

  /**
   * Maak een nieuw account aan. Logt de gebruiker daarna meteen in.
   */
  async register(
    username: string,
    password: string,
    remember: boolean
  ): Promise<AuthResult> {
    if (!isSupabaseEnabled()) {
      return {
        user: null,
        error:
          "Supabase is niet geconfigureerd. Zet VITE_SUPABASE_URL en " +
          "VITE_SUPABASE_ANON_KEY in je .env bestand.",
      };
    }

    try {
      const { data, error } = await supabase!.rpc("register_user", {
        p_username: username,
        p_password: password,
      });

      if (error) {
        return { user: null, error: translateError(error.message) };
      }

      const rows = (data ?? []) as UserRow[];
      if (rows.length === 0) {
        return { user: null, error: "Account aanmaken is mislukt." };
      }

      // Direct inloggen zodat `last_login` gevuld wordt.
      return await this.login(username, password, remember);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { user: null, error: translateError(message) };
    }
  },

  /**
   * Log uit. De onthouden gebruikersnaam blijft staan voor een snelle
   * volgende login (het wachtwoord wordt nooit bewaard).
   */
  logout(): void {
    try {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    } catch (err) {
      console.warn("Kon sessie niet verwijderen:", err);
    }
  },

  /**
   * Sla de sessie op. localStorage bij "onthoud mij", anders sessionStorage.
   */
  saveSession(user: AuthUser, remember: boolean): void {
    const session: StoredSession = {
      userId: user.id,
      username: user.username,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      expiresAt: remember
        ? new Date(Date.now() + REMEMBER_ME_DAYS * 24 * 60 * 60 * 1000).toISOString()
        : null,
      remember,
    };

    try {
      const payload = JSON.stringify(session);

      if (remember) {
        localStorage.setItem(SESSION_KEY, payload);
        localStorage.setItem(REMEMBERED_USER_KEY, user.username);
        sessionStorage.removeItem(SESSION_KEY);
      } else {
        sessionStorage.setItem(SESSION_KEY, payload);
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(REMEMBERED_USER_KEY);
      }
    } catch (err) {
      console.warn("Kon sessie niet opslaan:", err);
    }
  },

  /**
   * Haal de opgeslagen sessie op. Verlopen sessies worden opgeruimd.
   */
  getSession(): AuthUser | null {
    try {
      // sessionStorage heeft voorrang: dat is de sessie van deze tab.
      const raw =
        sessionStorage.getItem(SESSION_KEY) ?? localStorage.getItem(SESSION_KEY);
      if (!raw) return null;

      const session = JSON.parse(raw) as StoredSession;

      if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
        this.logout();
        console.log("🔒 Sessie verlopen, opnieuw inloggen vereist");
        return null;
      }

      return sessionToUser(session);
    } catch (err) {
      console.warn("Kon sessie niet lezen:", err);
      return null;
    }
  },

  /**
   * De laatst onthouden gebruikersnaam, om het inlogveld voor te vullen.
   */
  getRememberedUsername(): string {
    try {
      return localStorage.getItem(REMEMBERED_USER_KEY) ?? "";
    } catch {
      return "";
    }
  },
};
