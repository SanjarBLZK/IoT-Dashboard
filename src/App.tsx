import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Rack, Incident } from "./types";
import { Navigation } from "./components/Navigation";
import { Dashboard } from "./pages/Dashboard";
import { IncidentsPage } from "./pages/IncidentsPage";
import { playAlertBeep, playNotificationSound } from "./utils/audio";
import {
  createInitialRacks,
  updateRackWithNewReading,
  createMotionIncident,
  createTemperatureAlarm,
  randomBetween,
} from "./utils/simulation";

function App() {
  // State
  const [racks, setRacks] = useState<Rack[]>(createInitialRacks());
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Refs voor ID tracking
  const incidentIdRef = useRef(1);
  const previousCriticalRacks = useRef<Set<number>>(new Set());

  // Update sensor data elke 5 seconden (in productie: 60 seconden)
  useEffect(() => {
    const interval = setInterval(() => {
      setRacks((prevRacks) =>
        prevRacks.map((rack) => updateRackWithNewReading(rack))
      );
    }, 5000); // 5 seconden voor demo, productie: 60000 (1 minuut)

    return () => clearInterval(interval);
  }, []);

  // Check voor kritieke temperaturen en speel alarm
  useEffect(() => {
    const criticalRacks = racks.filter((r) => r.status === "critical");
    const criticalRackIds = new Set(criticalRacks.map((r) => r.id));

    // Check voor nieuwe kritieke racks
    criticalRacks.forEach((rack) => {
      if (!previousCriticalRacks.current.has(rack.id)) {
        // Nieuwe kritieke rack gedetecteerd
        const alarm = createTemperatureAlarm(
          incidentIdRef.current++,
          rack.id,
          rack.name
        );
        setIncidents((prev) => [alarm, ...prev.slice(0, 19)]);
        playAlertBeep();
        setAlertDismissed(false);
      }
    });

    previousCriticalRacks.current = criticalRackIds;
  }, [racks]);

  // Simuleer bewegingsdetectie (random tussen 45-90 seconden)
  useEffect(() => {
    const scheduleMotion = () => {
      const delay = randomBetween(45000, 90000, 0); // 45-90 seconden
      const timer = setTimeout(() => {
        const motion = createMotionIncident(incidentIdRef.current++);
        setIncidents((prev) => [motion, ...prev.slice(0, 19)]); // Max 20 incidents
        playNotificationSound();
        scheduleMotion(); // Plan volgende
      }, delay);
      return timer;
    };

    const timer = scheduleMotion();
    return () => clearTimeout(timer);
  }, []);

  // Check of er kritieke status is
  const hasCritical = racks.some((r) => r.status === "critical");
  const criticalRackNames = racks
    .filter((r) => r.status === "critical")
    .map((r) => r.name)
    .join(", ");

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
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
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
