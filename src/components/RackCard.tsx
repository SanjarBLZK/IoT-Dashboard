import { Rack, RackStatus } from "../types";
import { StatusDot } from "./StatusDot";
import { StatusBadge } from "./StatusBadge";
import { TempArc } from "./TempArc";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface RackCardProps {
  rack: Rack;
  onClick: () => void;
}

export function RackCard({ rack, onClick }: RackCardProps) {
  // Kleur bepalen voor de mini chart en humidity bar
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
    ? { bg: "bg-blue-500/20", text: "text-blue-400", icon: "🖥️", label: "Server" }
    : { bg: "bg-purple-500/20", text: "text-purple-400", icon: "🌐", label: "Netwerk" };

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 rounded-xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-slate-900/50 hover:scale-[1.02]"
    >
      {/* Header met status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center gap-2">
            <StatusDot status={rack.status} />
            <h3 className="text-lg font-semibold text-slate-100">{rack.name}</h3>
          </div>
          <div className="flex items-center gap-2 ml-5">
            <p className="text-sm text-slate-400">{rack.location}</p>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeBadge.bg} ${typeBadge.text} flex items-center gap-1`}>
              <span>{typeBadge.icon}</span>
              <span>{typeBadge.label}</span>
            </span>
          </div>
        </div>
        <StatusBadge status={rack.status} />
      </div>

      {/* Temperatuur gauge + Humidity info */}
      <div className="flex items-center justify-between mb-4">
        <TempArc temp={rack.temp} />

        <div className="flex flex-col gap-3 flex-1 ml-6">
          {/* Humidity */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Luchtvochtigheid</span>
              <span className="text-slate-200 font-medium">
                {rack.humidity.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-1.5 rounded-full bg-cyan-400 transition-all duration-500"
                style={{ width: `${Math.min(rack.humidity, 100)}%` }}
              />
            </div>
          </div>

          {/* Devices */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Apparaten</span>
            <span className="text-emerald-400 font-medium">
              {rack.devices.length} actief
            </span>
          </div>
        </div>
      </div>

      {/* Mini chart (laatste 15 metingen) */}
      <div className="h-12 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rack.history.slice(-15)}>
            <Line
              type="monotone"
              dataKey="temp"
              stroke={color}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer info */}
      <div className="mt-3 pt-3 border-t border-slate-700/50 text-xs text-slate-500">
        Klik voor details
      </div>
    </button>
  );
}
