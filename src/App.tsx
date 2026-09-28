import { useState, useEffect, useRef, useCallback } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Rack, Incident } from "./types";
import { Navigation } from "./components/Navigation";
import { Dashboard } from "./pages/Dashboard";
import { IncidentsPage } from "./pages/IncidentsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { LoginPage } from "./pages/LoginPage";
import { playAlertBeep, playNotificationSound } from "./utils/audio";
import { incidentService } from "./services/incidentService";
import { sensorService } from "./services/sensorService";
import { useSettings } from "./hooks/useSettings";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { buildRacks } from "./utils/simulation";

// Hoe vaak we nieuwe sensordata en incidents ophalen.
const POLL_INTERVAL_MS = 15_000;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </BrowserRouter>
  );
}

/**
 * Bepaalt of het dashboard of het inlogscherm getoond wordt.
 * Het monitoring-gedeelte wordt pas gemount na een geldige sessie, zodat we
 * geen API-calls doen voor iemand die niet is ingelogd.
 */
function AuthGate() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Sessie controleren...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <MonitoringApp />;
}

/**
 * Het dashboard. Haalt sensordata, incidents en drempelwaarden op bij de API.
 *
 * De sensorsimulatie draait op de server, dus dit component genereert zelf
 * geen data meer: het toont wat er in de database staat. Daardoor zien alle
 * apparaten hetzelfde.
 */
function MonitoringApp() {
  const { rackThresholds, audio, isLoading: settingsLoading } = useSettings();

  const [racks, setRacks] = useState<Rack[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Onthoudt welke racks al kritiek waren en welk incident we al gezien
  // hebben, zodat we niet bij elke poll opnieuw geluid afspelen.
  const previousCriticalRacks = useRef<Set<number>>(new Set());
  const lastSeenIncidentId = useRef<number | null>(null);
  const isFirstLoad = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const [{ readings }, latestIncidents] = await Promise.all([
        sensorService.getReadings(),
        incidentService.getRecentIncidents(50),
      ]);

      setRacks(buildRacks(readings, rackThresholds));
      setIncidents(latestIncidents);
      setLoadError(null);

      // Geluid bij een nieuw incident, maar niet bij de eerste keer laden
      // (dan zou je de hele geschiedenis te horen krijgen).
      const newest = latestIncidents[0];
      if (newest) {
        if (isFirstLoad.current) {
          lastSeenIncidentId.current = newest.id;
        } else if (
          lastSeenIncidentId.current !== null &&
          newest.id > lastSeenIncidentId.current
        ) {
          if (newest.type === "beweging" && audio.notificationEnabled) {
            playNotificationSound(audio.notificationVolume);
          }
          lastSeenIncidentId.current = newest.id;
        }
      }

      isFirstLoad.current = false;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Kon data niet ophalen.";
      setLoadError(message);
      console.error("❌ Ophalen mislukt:", message);
    }
  }, [rackThresholds, audio.notificationEnabled, audio.notificationVolume]);

  // Wacht met ophalen tot de drempelwaarden binnen zijn, anders zou de status
  // even op basis van de defaults worden berekend.
  useEffect(() => {
    if (settingsLoading) return;

    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh, settingsLoading]);

  // Alarm bij een rack dat nieuw kritiek wordt.
  useEffect(() => {
    const criticalIds = new Set(
      racks.filter((r) => r.status === "critical").map((r) => r.id)
    );

    const hasNewCritical = [...criticalIds].some(
      (id) => !previousCriticalRacks.current.has(id)
    );

    if (hasNewCritical) {
      if (audio.audioEnabled) {
        playAlertBeep(audio.alarmVolume);
      }
      setAlertDismissed(false);
    }

    previousCriticalRacks.current = criticalIds;
  }, [racks, audio.audioEnabled, audio.alarmVolume]);

  const hasCritical = racks.some((r) => r.status === "critical");
  const criticalRackNames = racks
    .filter((r) => r.status === "critical")
    .map((r) => r.name)
    .join(", ");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-start justify-center p-6">
      <div className="w-full max-w-5xl">
        <Navigation />

        {/* Verbindingsprobleem met de API */}
        {loadError && (
          <div
            role="alert"
            className="mb-6 bg-red-500/10 border border-red-500/40 rounded-lg p-4 text-sm text-red-200"
          >
            <span className="font-semibold">Geen data: </span>
            {loadError}
          </div>
        )}

        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                racks={racks}
                hasCritical={hasCritical}
                criticalRackNames={criticalRackNames}
                alertDismissed={alertDismissed}
                onAlertDismiss={() => setAlertDismissed(true)}
                playAlertBeep={playAlertBeep}
              />
            }
          />
          <Route
            path="/incidents"
            element={
              <IncidentsPage
                incidents={incidents}
                racks={racks}
                hasCritical={hasCritical}
                criticalRackNames={criticalRackNames}
                alertDismissed={alertDismissed}
                onAlertDismiss={() => setAlertDismissed(true)}
                playAlertBeep={playAlertBeep}
              />
            }
          />
          <Route
            path="/settings"
            element={
              <SettingsPage
                hasCritical={hasCritical}
                criticalRackNames={criticalRackNames}
                alertDismissed={alertDismissed}
                onAlertDismiss={() => setAlertDismissed(true)}
                playAlertBeep={playAlertBeep}
              />
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
