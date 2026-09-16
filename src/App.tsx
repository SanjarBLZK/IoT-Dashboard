import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Rack, Incident } from "./types";
import { Navigation } from "./components/Navigation";
import { Dashboard } from "./pages/Dashboard";
import { IncidentsPage } from "./pages/IncidentsPage";
import { playAlertBeep, playNotificationSound } from "./utils/audio";
import { incidentService } from "./services/incidentService";
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

  // Laad bestaande incidents bij opstarten (indien Supabase geconfigureerd)
  useEffect(() => {
    const loadIncidents = async () => {
      const existingIncidents = await incidentService.getRecentIncidents(20);
      if (existingIncidents && existingIncidents.length > 0) {
        setIncidents(existingIncidents);
        // Update ID ref naar het hoogste ID + 1
        const maxId = Math.max(...existingIncidents.map(i => i.id));
        incidentIdRef.current = maxId + 1;
        console.log(`📚 ${existingIncidents.length} incidents geladen uit Supabase`);
      }
    };

    loadIncidents();

    // Subscribe to real-time incident updates from other sources
    const unsubscribe = incidentService.subscribeToIncidents((newIncident) => {
      console.log('🔔 Nieuw incident ontvangen via real-time:', newIncident);
      setIncidents((prev) => {
        // Check if incident already exists (prevent duplicates)
        if (prev.some(i => i.id === newIncident.id)) {
          return prev;
        }
        return [newIncident, ...prev.slice(0, 19)];
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Update sensor data elke minuut
  useEffect(() => {
    const interval = setInterval(() => {
      setRacks((prevRacks) =>
        prevRacks.map((rack) => updateRackWithNewReading(rack))
      );
    }, 60000); // 1 minuut

    return () => clearInterval(interval);
  }, []);

  // Check voor kritieke temperaturen en speel alarm
  useEffect(() => {
    const criticalRacks = racks.filter((r) => r.status === "critical");
    const criticalRackIds = new Set(criticalRacks.map((r) => r.id));

    // Check voor nieuwe kritieke racks
    criticalRacks.forEach(async (rack) => {
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
        
        // Sla op in Supabase
        const saved = await incidentService.saveIncident({
          time: alarm.time,
          type: alarm.type,
          rack: alarm.rack,
          message: alarm.message,
        });
        
        if (saved) {
          console.log('🚨 Temperatuur alarm opgeslagen in Supabase database');
        }
      }
    });

    previousCriticalRacks.current = criticalRackIds;
  }, [racks]);

  // Simuleer bewegingsdetectie (random tussen 45-90 seconden)
  useEffect(() => {
    const scheduleMotion = () => {
      const delay = randomBetween(45000, 90000, 0); // 45-90 seconden
      const timer = setTimeout(() => {
        triggerMotionDetection();
        scheduleMotion(); // Plan volgende
      }, delay);
      return timer;
    };

    const timer = scheduleMotion();
    return () => clearTimeout(timer);
  }, []);

  // Handler voor bewegingsdetectie (kan ook manueel worden getriggerd via camera button)
  const triggerMotionDetection = async () => {
    const motion = createMotionIncident(incidentIdRef.current++);
    
    // Voeg toe aan lokale state
    setIncidents((prev) => [motion, ...prev.slice(0, 19)]); // Max 20 incidents
    
    // Speel notificatie geluid
    playNotificationSound();
    
    // Sla op in Supabase (als geconfigureerd)
    const saved = await incidentService.saveIncident({
      time: motion.time,
      type: motion.type,
      message: motion.message,
      photo: motion.photo,
    });
    
    if (saved) {
      console.log('📷 Camera detectie opgeslagen in Supabase database');
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
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
