import { Incident, Rack } from "../types";
import { IncidentList } from "../components/IncidentList";

interface IncidentsPageProps {
  incidents: Incident[];
  racks: Rack[];
  hasCritical: boolean;
  criticalRackNames: string;
  alertDismissed: boolean;
  onAlertDismiss: () => void;
  playAlertBeep: () => void;
}

export function IncidentsPage({
  incidents,
  racks,
  hasCritical,
  criticalRackNames,
  alertDismissed,
  onAlertDismiss,
  playAlertBeep,
}: IncidentsPageProps) {
  // Filter incidents by type
  const criticalIncidents = incidents.filter((i) => i.type === "alarm");
  const motionIncidents = incidents.filter((i) => i.type === "motion");
  const resolvedIncidents = incidents.filter((i) => i.type === "resolved");

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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-2xl">
              📋
            </div>
            <div>
              <div className="text-slate-400 text-sm">Totaal</div>
              <div className="text-2xl font-bold text-slate-100">
                {incidents.length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-red-500/40 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center text-2xl">
              🚨
            </div>
            <div>
              <div className="text-slate-400 text-sm">Alarmen</div>
              <div className="text-2xl font-bold text-red-400">
                {criticalIncidents.length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-amber-500/40 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center text-2xl">
              📷
            </div>
            <div>
              <div className="text-slate-400 text-sm">Beweging</div>
              <div className="text-2xl font-bold text-amber-400">
                {motionIncidents.length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-emerald-500/40 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center text-2xl">
              ✅
            </div>
            <div>
              <div className="text-slate-400 text-sm">Opgelost</div>
              <div className="text-2xl font-bold text-emerald-400">
                {resolvedIncidents.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rack Status Overview */}
      <section className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-4 text-slate-100">
          Rack Status Overzicht
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {racks.map((rack) => (
            <div
              key={rack.id}
              className={`
                border rounded-lg p-4 transition-all
                ${
                  rack.status === "critical"
                    ? "bg-red-950/40 border-red-500/40"
                    : rack.status === "warn"
                    ? "bg-amber-950/40 border-amber-500/40"
                    : "bg-emerald-950/40 border-emerald-500/40"
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-100">{rack.name}</h3>
                <span
                  className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${
                      rack.status === "critical"
                        ? "bg-red-500/20 text-red-400"
                        : rack.status === "warn"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-emerald-500/20 text-emerald-400"
                    }
                  `}
                >
                  {rack.status === "critical"
                    ? "Kritiek"
                    : rack.status === "warn"
                    ? "Waarschuwing"
                    : "Normaal"}
                </span>
              </div>
              <div className="text-sm text-slate-400">{rack.location}</div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">Temperatuur</div>
                  <div
                    className={`text-lg font-semibold ${
                      rack.status === "critical"
                        ? "text-red-400"
                        : rack.status === "warn"
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {rack.temp.toFixed(1)}°C
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Luchtvochtigheid</div>
                  <div className="text-lg font-semibold text-cyan-400">
                    {rack.humidity.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* All Incidents */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-slate-100">
          Alle Gebeurtenissen
        </h2>
        <IncidentList incidents={incidents} />
      </section>
    </div>
  );
}
