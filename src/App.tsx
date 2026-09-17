import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Rack, Incident } from "./types";
import { Navigation } from "./components/Navigation";
import { Dashboard } from "./pages/Dashboard";
import { IncidentsPage } from "./pages/IncidentsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { playAlertBeep, playNotificationSound } from "./utils/audio";
import { incidentService } from "./services/incidentService";
import { useSettings, DEFAULT_THRESHOLDS } from "./hooks/useSettings";
import {
  createInitialRacks,
  updateRackWithNewReading,
  createMotionIncident,
  createTemperatureAlarm,
  randomBetween,
} from "./utils/simulation";

function App() {
  // Settings hook (per-rack thresholds + lokale audio voorkeuren)
  const { rackThresholds, audio } = useSettings();

  // State
  const [racks, setRacks] = useState<Rack[]>(createInitialRacks());
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Refs voor ID tracking
  const incidentIdRef = useRef(1);
  const previousCriticalRacks = useRef<Set<number>>(new Set());

  // Laad bestaande incidents bij opstarten (indien Supabase geconfigureerd)
  useEffect(() => {
    const loadIncidents = async () => {
      const existingIncidents = await incidentService.getRecentIncidents(20);
      if (existingIncidents && existingIncidents.length > 0) {
        setIncidents(existingIncidents);
        const maxId = Math.max(...existingIncidents.map((i) => i.id));
        incidentIdRef.current = maxId + 1;
        console.log(`📚 ${existingIncidents.length} incidents geladen uit Supabase`);
      }
    };

    loadIncidents();

    // Subscribe to real-time incident updates
    const unsubscribe = incidentService.subscribeToIncidents((newIncident) => {
      console.log("🔔 Nieuw incident ontvangen via real-time:", newIncident);
      setIncidents((prev) => {
        if (prev.some((i) => i.id === newIncident.id)) return prev;
        return [newIncident, ...prev.slice(0, 19)];
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Update sensor data elke minuut, per-rack met eigen thresholds.
  useEffect(() => {
    const interval = setInterval(() => {
      setRacks((prevRacks) =>
        prevRacks.map((rack) => {
          const th = rackThresholds[rack.id] ?? { rackId: rack.id, ...DEFAULT_THRESHOLDS };
          return updateRackWithNewReading(rack, th);
        })
      );
    }, 60000);

    return () => clearInterval(interval);
  }, [rackThresholds]);

  // Check voor kritieke temperaturen en speel alarm
  useEffect(() => {
    const criticalRacks = racks.filter((r) => r.status === "critical");
    const criticalRackIds = new Set(criticalRacks.map((r) => r.id));

    criticalRacks.forEach(async (rack) => {
      if (!previousCriticalRacks.current.has(rack.id)) {
        const alarm = createTemperatureAlarm(incidentIdRef.current++, rack.name);
        setIncidents((prev) => [alarm, ...prev.slice(0, 19)]);

        if (audio.audioEnabled) {
          playAlertBeep(audio.alarmVolume);
        }
        setAlertDismissed(false);

        const saved = await incidentService.saveIncident({
          time: alarm.time,
          type: alarm.type,
          description: alarm.description,
          imagePath: alarm.imagePath,
        });

        if (saved) {
          console.log("🚨 Temperatuur alarm opgeslagen in Supabase database");
        }
      }
    });

    previousCriticalRacks.current = criticalRackIds;
  }, [racks, audio.audioEnabled, audio.alarmVolume]);

  // Simuleer bewegingsdetectie (random tussen 45-90 seconden)
  useEffect(() => {
    const scheduleMotion = () => {
      const delay = randomBetween(45000, 90000, 0);
      const timer = setTimeout(() => {
        triggerMotionDetection();
        scheduleMotion();
      }, delay);
      return timer;
    };

    const timer = scheduleMotion();
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handler voor bewegingsdetectie
  const triggerMotionDetection = async () => {
    const motion = createMotionIncident(incidentIdRef.current++);

    setIncidents((prev) => [motion, ...prev.slice(0, 19)]);

    if (audio.notificationEnabled) {
      playNotificationSound(audio.notificationVolume);
    }

    const saved = await incidentService.saveIncident({
      time: motion.time,
      type: motion.type,
      description: motion.description,
      imagePath: motion.imagePath,
    });

    if (saved) {
      console.log("📷 Camera detectie opgeslagen in Supabase database");
    }
  };

  // Check of er kritieke status is
  const hasCritical = racks.some((r) => r.status === "critical");
  const criticalRackNames = racks
    .filter((r) => r.status === "critical")
    .map((r) => r.name)
    .join(", ");

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-start justify-center p-6">
        <div className="w-full max-w-5xl">
          <Navigation />

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
    </BrowserRouter>
  );
}

export default App;
