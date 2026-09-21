import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { AuthUser } from "../types";
import { authService } from "../services/authService";

interface AuthContextValue {
  /** De ingelogde gebruiker, of null als er niemand is ingelogd. */
  user: AuthUser | null;
  /** True tijdens het herstellen van een opgeslagen sessie bij opstarten. */
  isLoading: boolean;
  /** Log in. Returns een foutmelding, of null bij succes. */
  login: (
    username: string,
    password: string,
    remember: boolean
  ) => Promise<string | null>;
  /** Maak een account aan en log direct in. Returns foutmelding of null. */
  register: (
    username: string,
    password: string,
    remember: boolean
  ) => Promise<string | null>;
  /** Log uit en wis de sessie. */
  logout: () => void;
  /** Laatst onthouden gebruikersnaam, om het formulier voor te vullen. */
  rememberedUsername: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rememberedUsername, setRememberedUsername] = useState("");

  // Herstel een bestaande sessie bij het opstarten van de app.
  useEffect(() => {
    const existing = authService.getSession();
    if (existing) {
      setUser(existing);
      console.log(`🔓 Sessie hersteld voor "${existing.username}"`);
    }
    setRememberedUsername(authService.getRememberedUsername());
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (username: string, password: string, remember: boolean) => {
      const { user: loggedIn, error } = await authService.login(
        username,
        password,
        remember
      );

      if (error || !loggedIn) {
        return error ?? "Inloggen is mislukt.";
      }

      setUser(loggedIn);
      setRememberedUsername(authService.getRememberedUsername());
      return null;
    },
    []
  );

  const register = useCallback(
    async (username: string, password: string, remember: boolean) => {
      const { user: created, error } = await authService.register(
        username,
        password,
        remember
      );

      if (error || !created) {
        return error ?? "Account aanmaken is mislukt.";
      }

      setUser(created);
      setRememberedUsername(authService.getRememberedUsername());
      return null;
    },
    []
  );

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setRememberedUsername(authService.getRememberedUsername());
    console.log("🔒 Uitgelogd");
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, rememberedUsername }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth moet binnen een <AuthProvider> gebruikt worden.");
  }
  return ctx;
}
