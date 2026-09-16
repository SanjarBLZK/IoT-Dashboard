import { useState } from "react";
import { Rack } from "../types";
import { RackCard } from "../components/RackCard";
import { RackDetail } from "../components/RackDetail";
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

interface DashboardProps {
  racks: Rack[];
  hasCritical: boolean;
  criticalRackNames: string;
  alertDismissed: boolean;
  onAlertDismiss: () => void;
  playAlertBeep: () => void;
}

export function Dashboard({
  racks,
  hasCritical,
  criticalRackNames,
  alertDismissed,
  onAlertDismiss,
  playAlertBeep,
}: DashboardProps) {
  const [selectedRack, setSelectedRack] = useState<Rack | null>(null);

  // Data voor comparison chart
  const comparisonData = racks[0]?.history.map((_, index) => ({
    time: racks[0].history[index].time,
    A: racks[0].history[index].temp,
    B: racks[1]?.history[index]?.temp,
    C: racks[2]?.history[index]?.temp,
  })) || [];

  return (
    <div className="space-y-6">
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
              onAlertDismiss();
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
        <h2 className="text-2xl font-semibold mb-4 text-slate-100">
          Server Racks
        </h2>
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
        <h2 className="text-2xl font-semibold mb-4 text-slate-100">
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
