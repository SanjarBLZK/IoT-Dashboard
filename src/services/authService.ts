import { api, ApiError } from "./apiClient";
import { AuthUser } from "../types";

/**
 * Authenticatie via de backend API.
 *
 * Het wachtwoord wordt server-side met bcrypt gehasht en vergeleken; de
 * browser krijgt de hash nooit te zien. De sessie is een httpOnly cookie dat
 * door de server is ondertekend (JWT). JavaScript kan er niet bij, dus een
 * XSS-lek kan het token niet stelen, en de inhoud is niet te manipuleren.
 *
 * "Onthoud mij" bepaalt de levensduur van dat cookie: 30 dagen bij aan,
 * 12 uur bij uit.
 */

// Alleen de gebruikersnaam onthouden we lokaal, om het inlogveld voor te
// vullen. Het wachtwoord wordt nooit bewaard.
const REMEMBERED_USER_KEY = "iot-dashboard-remembered-username";

interface UserResponse {
  user: AuthUser;
}

export interface AuthResult {
  user: AuthUser | null;
  error: string | null;
}

function rememberUsername(username: string, remember: boolean): void {
  try {
    if (remember) {
      localStorage.setItem(REMEMBERED_USER_KEY, username);
    } else {
      localStorage.removeItem(REMEMBERED_USER_KEY);
    }
  } catch {
    // localStorage kan geblokkeerd zijn; niet kritisch.
  }
}

export const authService = {
  /**
   * Log in. Bij succes zet de server het sessiecookie en werkt `last_login` bij.
   */
  async login(
    username: string,
    password: string,
    remember: boolean
  ): Promise<AuthResult> {
    try {
      const { user } = await api.post<UserResponse>("/auth/login", {
        username,
        password,
        remember,
      });

      rememberUsername(user.username, remember);
      return { user, error: null };
    } catch (err) {
      return {
        user: null,
        error:
          err instanceof ApiError ? err.message : "Inloggen is mislukt.",
      };
    }
  },

  /**
   * Maak een account aan. De server logt direct in bij succes.
   */
  async register(
    username: string,
    password: string,
    remember: boolean
  ): Promise<AuthResult> {
    try {
      const { user } = await api.post<UserResponse>("/auth/register", {
        username,
        password,
        remember,
      });

      rememberUsername(user.username, remember);
      return { user, error: null };
    } catch (err) {
      return {
        user: null,
        error:
          err instanceof ApiError
            ? err.message
            : "Account aanmaken is mislukt.",
      };
    }
  },

  /**
   * Log uit. De server wist het sessiecookie.
   */
  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ook bij een serverfout willen we lokaal uitgelogd raken.
    }
  },

  /**
   * Haal de huidige sessie op. Returns null als er niemand is ingelogd.
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    const result = await api.get<UserResponse | null>("/auth/me", true);
    return result?.user ?? null;
  },

  /**
   * Of er al minstens een account bestaat. Bij een verse installatie kan het
   * inlogscherm dan direct de registratie-tab tonen.
   */
  async hasAnyAccount(): Promise<boolean> {
    try {
      const { hasAccount } = await api.get<{ hasAccount: boolean }>(
        "/auth/exists"
      );
      return hasAccount;
    } catch {
      // Bij twijfel de login-tab tonen.
      return true;
    }
  },

  getRememberedUsername(): string {
    try {
      return localStorage.getItem(REMEMBERED_USER_KEY) ?? "";
    } catch {
      return "";
    }
  },
};
