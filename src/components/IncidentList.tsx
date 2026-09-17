import { Incident, IncidentType } from "../types";

interface IncidentListProps {
  incidents: Incident[];
}

const TYPE_META: Record<
  IncidentType,
  { label: string; icon: string; border: string; text: string }
> = {
  beweging: {
    label: "BEWEGING GEDETECTEERD",
    icon: "📷",
    border: "border-amber-500/40 bg-amber-500/10",
    text: "text-amber-400",
  },
  geluid: {
    label: "GELUID GEDETECTEERD",
    icon: "🔊",
    border: "border-sky-500/40 bg-sky-500/10",
    text: "text-sky-400",
  },
  temperatuur: {
    label: "TEMPERATUUR ALARM",
    icon: "🚨",
    border: "border-red-500/40 bg-red-500/10",
    text: "text-red-400",
  },
};

export function IncidentList({ incidents }: IncidentListProps) {
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
      {incidents.map((incident) => {
        const meta = TYPE_META[incident.type];
        return (
          <div
            key={incident.id}
            className={`border rounded-xl p-4 transition-all duration-200 ${meta.border}`}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="text-3xl flex-shrink-0">{meta.icon}</div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-semibold text-sm ${meta.text}`}>
                    {meta.label}
                  </span>
                </div>
                <p className="text-slate-200 text-sm mb-2">
                  {incident.description}
                </p>
                <div className="text-xs text-slate-500">{incident.time}</div>
              </div>

              {/* Photo preview (indien aanwezig) */}
              {incident.imagePath && (
                <div className="flex-shrink-0">
                  <img
                    src={incident.imagePath}
                    alt="Bewegingsdetectie foto"
                    className="w-32 h-24 rounded-lg object-cover border-2 border-amber-500/40 shadow-lg hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => window.open(incident.imagePath, "_blank")}
                    title="Klik om foto te vergroten"
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
