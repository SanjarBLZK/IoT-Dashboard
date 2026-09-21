import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { isSupabaseEnabled } from "../lib/supabaseClient";

type Mode = "login" | "register";

export function LoginPage() {
  const { login, register, rememberedUsername } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabaseReady = isSupabaseEnabled();

  // Vul de onthouden gebruikersnaam voor en vink "onthoud mij" alvast aan.
  useEffect(() => {
    if (rememberedUsername) {
      setUsername(rememberedUsername);
      setRemember(true);
    }
  }, [rememberedUsername]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setPassword("");
    setPasswordConfirm("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUsername = username.trim();

    // Client-side validatie (de database valideert nogmaals).
    if (trimmedUsername.length < 3) {
      setError("Gebruikersnaam moet minimaal 3 tekens bevatten.");
      return;
    }
    if (password.length < 8) {
      setError("Wachtwoord moet minimaal 8 tekens bevatten.");
      return;
    }
    if (mode === "register" && password !== passwordConfirm) {
      setError("De wachtwoorden komen niet overeen.");
      return;
    }

    setIsSubmitting(true);
    const failure =
      mode === "login"
        ? await login(trimmedUsername, password, remember)
        : await register(trimmedUsername, password, remember);
    setIsSubmitting(false);

    if (failure) {
      setError(failure);
      setPassword("");
      setPasswordConfirm("");
    }
    // Bij succes wisselt AuthGate automatisch naar het dashboard.
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo / titel */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg shadow-cyan-500/20">
            IoT
          </div>
          <h1 className="text-2xl font-bold text-slate-100">
            Server Room Monitoring
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {mode === "login"
              ? "Log in om het dashboard te bekijken"
              : "Maak een nieuw account aan"}
          </p>
        </div>

        {/* Waarschuwing als Supabase niet is ingesteld */}
        {!supabaseReady && (
          <div
            role="alert"
            className="mb-6 bg-amber-500/10 border border-amber-500/40 rounded-lg p-4 text-sm text-amber-200"
          >
            <div className="font-semibold mb-1">⚠️ Database niet verbonden</div>
            Zet <code className="font-mono">VITE_SUPABASE_URL</code> en{" "}
            <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> in je{" "}
            <code className="font-mono">.env</code> bestand en herstart{" "}
            <code className="font-mono">npm run dev</code>.
          </div>
        )}

        {/* Formulier */}
        <form
          onSubmit={handleSubmit}
          className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 space-y-5"
        >
          {/* Mode tabs */}
          <div className="flex gap-1 bg-slate-900/60 rounded-lg p-1">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === "login"
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Inloggen
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === "register"
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Registreren
            </button>
          </div>

          {/* Foutmelding */}
          {error && (
            <div
              role="alert"
              className="bg-red-500/10 border border-red-500/40 rounded-lg p-3 text-sm text-red-300 flex items-start gap-2"
            >
              <span aria-hidden="true">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Gebruikersnaam */}
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-slate-300"
            >
              Gebruikersnaam
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
              placeholder="bijv. jouwnaam"
              className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 disabled:opacity-50 transition-colors"
            />
          </div>

          {/* Wachtwoord */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-300"
            >
              Wachtwoord
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                placeholder="minimaal 8 tekens"
                className="w-full px-4 py-3 pr-12 bg-slate-900/60 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 disabled:opacity-50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={
                  showPassword ? "Wachtwoord verbergen" : "Wachtwoord tonen"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Wachtwoord bevestigen (alleen bij registreren) */}
          {mode === "register" && (
            <div className="space-y-2">
              <label
                htmlFor="passwordConfirm"
                className="block text-sm font-medium text-slate-300"
              >
                Wachtwoord bevestigen
              </label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                disabled={isSubmitting}
                placeholder="herhaal je wachtwoord"
                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 disabled:opacity-50 transition-colors"
              />
            </div>
          )}

          {/* Onthoud mij */}
          <label className="flex items-center gap-3 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              disabled={isSubmitting}
              className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors">
              Onthoud mij op dit apparaat
            </span>
          </label>
          <p className="text-xs text-slate-500 -mt-3 ml-7">
            {remember
              ? "Je blijft 30 dagen ingelogd, ook na het sluiten van de browser."
              : "Je wordt uitgelogd zodra je deze tab sluit."}
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !supabaseReady}
            className="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed rounded-lg font-bold text-white transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin" aria-hidden="true">
                  ⏳
                </span>
                {mode === "login" ? "Inloggen..." : "Account aanmaken..."}
              </>
            ) : (
              <>
                <span aria-hidden="true">
                  {mode === "login" ? "🔓" : "✨"}
                </span>
                {mode === "login" ? "Inloggen" : "Account aanmaken"}
              </>
            )}
          </button>
        </form>

        {/* Hint onderaan */}
        <p className="text-center text-xs text-slate-500 mt-6">
          {mode === "login" ? (
            <>
              Nog geen account?{" "}
              <button
                type="button"
                onClick={() => switchMode("register")}
                className="text-cyan-400 hover:text-cyan-300 underline"
              >
                Registreer er een
              </button>
            </>
          ) : (
            <>
              Heb je al een account?{" "}
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="text-cyan-400 hover:text-cyan-300 underline"
              >
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
