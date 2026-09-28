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
  /** True zolang we bij de server navragen of er een sessie is. */
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
  /** Log uit en wis de serversessie. */
  logout: () => Promise<void>;
  /** Laatst onthouden gebruikersnaam, om het formulier voor te vullen. */
  rememberedUsername: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rememberedUsername, setRememberedUsername] = useState("");

  // Bij het opstarten: navragen of het sessiecookie nog geldig is.
  // Dat cookie is httpOnly, dus alleen de server kan dat beoordelen.
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const current = await authService.getCurrentUser();
        if (!active) return;

        if (current) {
          setUser(current);
          console.log(`🔓 Sessie actief voor "${current.username}"`);
        }
      } catch (err) {
        console.warn("Kon sessie niet controleren:", err);
      } finally {
        if (active) {
          setRememberedUsername(authService.getRememberedUsername());
          setIsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
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

  const logout = useCallback(async () => {
    await authService.logout();
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
