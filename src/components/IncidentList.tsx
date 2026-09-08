import { Incident } from "../types";

interface IncidentListProps {
  incidents: Incident[];
}

export function IncidentList({ incidents }: IncidentListProps) {
  const getIncidentIcon = (type: Incident["type"]) => {
    switch (type) {
      case "motion":
        return "📷";
      case "alarm":
        return "🚨";
      case "resolved":
        return "✅";
    }
  };

  const getIncidentColor = (type: Incident["type"]) => {
    switch (type) {
      case "motion":
        return "border-amber-500/40 bg-amber-500/10";
      case "alarm":
        return "border-red-500/40 bg-red-500/10";
      case "resolved":
        return "border-emerald-500/40 bg-emerald-500/10";
    }
  };

  const getIncidentTextColor = (type: Incident["type"]) => {
    switch (type) {
      case "motion":
        return "text-amber-400";
      case "alarm":
        return "text-red-400";
      case "resolved":
        return "text-emerald-400";
    }
  };

  if (incidents.length === 0) {
    return (
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-8 text-center">
        <div className="text-slate-500 text-sm">
          Geen incidenten geregistreerd
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {incidents.map((incident) => (
        <div
          key={incident.id}
          className={`border rounded-xl p-4 transition-all duration-200 ${getIncidentColor(
            incident.type
          )}`}
        >
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="text-3xl flex-shrink-0">
              {getIncidentIcon(incident.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`font-semibold text-sm ${getIncidentTextColor(
                    incident.type
                  )}`}
                >
                  {incident.type === "motion"
                    ? "BEWEGING GEDETECTEERD"
                    : incident.type === "alarm"
                    ? "ALARM"
                    : "OPGELOST"}
                </span>
                {incident.rack && (
                  <span className="text-xs text-slate-400">
                    · Rack {incident.rack}
                  </span>
                )}
              </div>
              <p className="text-slate-200 text-sm mb-2">{incident.message}</p>
              <div className="text-xs text-slate-500">{incident.time}</div>
            </div>

            {/* Photo preview if motion detection */}
            {incident.photo && (
              <div className="flex-shrink-0">
                <img
                  src={incident.photo}
                  alt="Bewegingsdetectie"
                  className="w-24 h-24 rounded-lg object-cover border border-slate-600"
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
