import { useState, useEffect, useRef } from "react";
import { Rack, Incident } from "./types";
import { RackCard } from "./components/RackCard";
import { RackDetail } from "./components/RackDetail";
import { IncidentList } from "./components/IncidentList";
import { playAlertBeep, playNotificationSound } from "./utils/audio";
import {
  createInitialRacks,
  updateRackWithNewReading,
  createMotionIncident,
  createTemperatureAlarm,
  randomBetween,
} from "./utils/simulation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

function App() {
  // State
  const [racks, setRacks] = useState<Rack[]>(createInitialRacks());
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedRack, setSelectedRack] = useState<Rack | null>(null);
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

  // Data voor comparison chart
  const comparisonData = racks[0].history.map((_, index) => ({
    time: racks[0].history[index].time,
    A: racks[0].history[index].temp,
    B: racks[1].history[index]?.temp,
    C: racks[2].history[index]?.temp,
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Server Room Monitoring
          </h1>
          <p className="text-slate-400">
            Real-time temperatuur en vochtigheid monitoring
          </p>
        </header>

        {/* Critical Alert Banner */}
        {hasCritical && !alertDismissed && (
          <div className="bg-red-950/60 border border-red-500/40 rounded-xl p-4 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🚨</span>
              <div>
                <div className="font-semibold text-red-400 text-lg">
                  Kritieke temperatuur gedetecteerd!
                </div>
                <div className="text-red-300 text-sm">
                  Actie vereist: {criticalRackNames}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setAlertDismissed(true);
                playAlertBeep();
              }}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
            >
              Bevestigen
            </button>
          </div>
        )}

        {/* Rack Cards Grid */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Server Racks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {racks.map((rack) => (
              <RackCard
                key={rack.id}
                rack={rack}
                onClick={() => setSelectedRack(rack)}
              />
            ))}
          </div>
        </section>

        {/* Comparison Chart */}
        <section className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Temperatuurvergelijking
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="time"
                  stroke="#64748b"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  interval={5}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  domain={["auto", "auto"]}
                  label={{
                    value: "Temperatuur (°C)",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#64748b",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                    color: "#e2e8f0",
                  }}
                  labelStyle={{ color: "#94a3b8" }}
                />
                <ReferenceLine
                  y={28}
                  stroke="#f59e0b"
                  strokeDasharray="4 2"
                  label={{
                    value: "Drempel",
                    fill: "#f59e0b",
                    fontSize: 12,
                  }}
                />
                <ReferenceLine
                  y={35}
                  stroke="#ef4444"
                  strokeDasharray="4 2"
                  label={{
                    value: "Kritiek",
                    fill: "#ef4444",
                    fontSize: 12,
                  }}
                />
                <Line
                  dataKey="A"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={false}
                  name="Rack A"
                />
                <Line
                  dataKey="B"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  name="Rack B"
                />
                <Line
                  dataKey="C"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={false}
                  name="Rack C"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Incidents */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Recente Gebeurtenissen
          </h2>
          <IncidentList incidents={incidents} />
        </section>

        {/* Footer */}
        <footer className="text-center text-slate-500 text-sm py-4 border-t border-slate-800">
          <p>IoT Dashboard © 2026 | Real-time monitoring actief</p>
        </footer>
      </div>

      {/* Rack Detail Modal */}
      {selectedRack && (
        <RackDetail
          rack={selectedRack}
          onClose={() => setSelectedRack(null)}
        />
      )}
    </div>
  );
}

export default App;
