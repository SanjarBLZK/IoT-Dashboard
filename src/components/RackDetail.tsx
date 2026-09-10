import { useEffect } from "react";
import { Rack, RackStatus } from "../types";
import { StatusDot } from "./StatusDot";
import { StatusBadge } from "./StatusBadge";
import { TempArc } from "./TempArc";
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

interface RackDetailProps {
  rack: Rack;
  onClose: () => void;
}

export function RackDetail({ rack, onClose }: RackDetailProps) {
  // ESC key handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Kleur bepalen op basis van status
  const getColor = (status: RackStatus): string => {
    switch (status) {
      case "ok":
        return "#34d399";
      case "warn":
        return "#f59e0b";
      case "critical":
        return "#ef4444";
    }
  };

  const color = getColor(rack.status);

  // Type badge styling
  const typeBadge = rack.type === "server" 
    ? { bg: "bg-blue-500/20", text: "text-blue-400", icon: "🖥️", label: "Server Rack" }
    : { bg: "bg-purple-500/20", text: "text-purple-400", icon: "🌐", label: "Netwerk Rack" };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />

      {/* Modal content */}
      <div
        className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusDot status={rack.status} />
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-100">{rack.name}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${typeBadge.bg} ${typeBadge.text} flex items-center gap-1.5`}>
                  <span className="text-base">{typeBadge.icon}</span>
                  <span>{typeBadge.label}</span>
                </span>
                <StatusBadge status={rack.status} />
              </div>
              <p className="text-sm text-slate-400 mt-1">{rack.location}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 transition-colors p-2 hover:bg-slate-700 rounded-lg"
            aria-label="Sluiten"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 rounded-xl p-4 flex items-center justify-center">
              <TempArc temp={rack.temp} />
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 flex flex-col justify-center">
              <span className="text-sm text-slate-400 mb-2">
                Luchtvochtigheid
              </span>
              <span className="text-3xl font-bold text-cyan-400">
                {rack.humidity.toFixed(1)}%
              </span>
              <div className="mt-3 w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-cyan-400 transition-all duration-500"
                  style={{ width: `${Math.min(rack.humidity, 100)}%` }}
                />
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 flex flex-col justify-center">
              <span className="text-sm text-slate-400 mb-2">
                Actieve Apparaten
              </span>
              <span className="text-3xl font-bold text-emerald-400">
                {rack.devices.length}
              </span>
              <span className="text-xs text-slate-500 mt-1">
                Alle systemen operationeel
              </span>
            </div>
          </div>

          {/* Temperature chart */}
          <div className="bg-slate-900/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">
              Temperatuurverloop (30 minuten)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rack.history}>
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
                      value: "°C",
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
                      value: "Drempel (28°C)",
                      fill: "#f59e0b",
                      fontSize: 11,
                    }}
                  />
                  <ReferenceLine
                    y={35}
                    stroke="#ef4444"
                    strokeDasharray="4 2"
                    label={{
                      value: "Kritiek (35°C)",
                      fill: "#ef4444",
                      fontSize: 11,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="temp"
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    name="Temperatuur"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Humidity chart */}
          <div className="bg-slate-900/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">
              Luchtvochtigheidverloop (30 minuten)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rack.history}>
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
                    domain={[0, 100]}
                    label={{
                      value: "%",
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
                  <Line
                    type="monotone"
                    dataKey="humidity"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    dot={false}
                    name="Luchtvochtigheid"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Device lijst */}
          <div className="bg-slate-900/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">
              Apparaten in {rack.name}
            </h3>
            <div className="space-y-2">
              {rack.devices.map((device, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3 hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-mono text-sm">
                      #{index + 1}
                    </span>
                    <span className="text-slate-200">{device}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.4)]" />
                    <span className="text-emerald-400 text-sm font-medium">
                      ONLINE
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 p-4 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition-colors font-medium"
          >
            Sluiten (ESC)
          </button>
        </div>
      </div>
    </div>
  );
}
