import { useState } from "react";
import { useSettings, RACK_IDS, DEFAULT_THRESHOLDS } from "../hooks/useSettings";

interface SettingsPageProps {
  hasCritical: boolean;
  criticalRackNames: string;
  alertDismissed: boolean;
  onAlertDismiss: () => void;
  playAlertBeep: () => void;
}

// Display labels voor rack IDs (racks staan niet in de database).
const RACK_LABELS: Record<number, { name: string; location: string }> = {
  1: { name: "Rack A", location: "Noordzijde" },
  2: { name: "Rack B", location: "Centrale rij" },
  3: { name: "Rack C", location: "Zuidzijde" },
};

export function SettingsPage({
  hasCritical,
  criticalRackNames,
  alertDismissed,
  onAlertDismiss,
  playAlertBeep,
}: SettingsPageProps) {
  const {
    rackThresholds,
    audio,
    updateRackThreshold,
    updateAudio,
    resetAll,
    syncStatus,
    isSupabaseEnabled,
  } = useSettings();

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [resetConfirm, setResetConfirm] = useState(false);

  const handleSave = () => {
    // Wijzigingen worden al automatisch weggeschreven; deze knop toont enkel
    // een bevestiging.
    setSaveStatus("saving");
    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 500);
  };

  const handleReset = async () => {
    if (resetConfirm) {
      await resetAll();
      setResetConfirm(false);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } else {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 3000);
    }
  };

  const handleTestAlarm = () => {
    if (audio.audioEnabled) {
      playAlertBeep();
    }
  };

  return (
    <div className="space-y-6">
      {/* Critical Alert Banner */}
      {hasCritical && !alertDismissed && (
        <div className="bg-red-600 border border-red-500 rounded-lg p-4 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🚨</div>
            <div>
              <div className="font-bold text-white">KRITIEKE TEMPERATUUR</div>
              <div className="text-red-100 text-sm">{criticalRackNames}</div>
            </div>
          </div>
          <button
            onClick={onAlertDismiss}
            className="px-4 py-2 bg-red-800 hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-3xl">⚙️</div>
          <h1 className="text-3xl font-bold text-slate-100">Instellingen</h1>
        </div>
        <p className="text-slate-400">
          Configureer drempelwaarden per rack en audio voorkeuren.
        </p>

        {/* Supabase Status Indicator */}
        {isSupabaseEnabled && (
          <div className="mt-4 flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                syncStatus === "syncing"
                  ? "bg-yellow-500 animate-pulse"
                  : syncStatus === "synced"
                  ? "bg-green-500"
                  : syncStatus === "error"
                  ? "bg-red-500"
                  : "bg-slate-600"
              }`}
            />
            <span className="text-xs text-slate-400">
              {syncStatus === "syncing" && "Synchroniseren met server..."}
              {syncStatus === "synced" && "✅ Gesynchroniseerd met server"}
              {syncStatus === "error" && "❌ Synchronisatie mislukt"}
              {syncStatus === "idle" && "Verbonden met Supabase database"}
            </span>
          </div>
        )}
      </div>

      {/* Save Status Banner */}
      {saveStatus === "saved" && (
        <div className="bg-green-600/20 border border-green-500/50 rounded-lg p-4 flex items-center gap-3">
          <div className="text-2xl">✅</div>
          <div className="text-green-100 font-medium">
            Instellingen succesvol opgeslagen!
          </div>
        </div>
      )}

      {/* 1. Drempelwaarden per Rack */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-2xl">🌡️</div>
          <h2 className="text-xl font-bold text-slate-100">
            Drempelwaarden per Rack
          </h2>
        </div>
        <p className="text-sm text-slate-400 -mt-4">
          Deze waardes worden opgeslagen in de <code>settings</code> tabel.
        </p>

        {RACK_IDS.map((rackId) => {
          const t = rackThresholds[rackId] ?? { rackId, ...DEFAULT_THRESHOLDS };
          const label = RACK_LABELS[rackId] ?? { name: `Rack ${rackId}`, location: "" };

          return (
            <div
              key={rackId}
              className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-4 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-100 font-semibold">
                    {label.name}
                  </div>
                  {label.location && (
                    <div className="text-xs text-slate-500">{label.location}</div>
                  )}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  rack_id = {rackId}
                </div>
              </div>

              {/* Maximale temperatuur */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-medium text-sm">
                    Maximale temperatuur (alarm)
                  </label>
                  <span className="text-red-400 font-bold">
                    {t.tempThresholdHigh.toFixed(1)}°C
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="50"
                  step="0.5"
                  value={t.tempThresholdHigh}
                  onChange={(e) =>
                    updateRackThreshold(
                      rackId,
                      "tempThresholdHigh",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>

              {/* Minimale temperatuur */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-medium text-sm">
                    Minimale temperatuur (alarm)
                  </label>
                  <span className="text-sky-400 font-bold">
                    {t.tempThresholdLow.toFixed(1)}°C
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="0.5"
                  value={t.tempThresholdLow}
                  onChange={(e) =>
                    updateRackThreshold(
                      rackId,
                      "tempThresholdLow",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
              </div>

              {/* Luchtvochtigheidsdrempel */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-medium text-sm">
                    Luchtvochtigheidsdrempel
                  </label>
                  <span className="text-cyan-400 font-bold">
                    {t.humidityThreshold.toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="90"
                  step="1"
                  value={t.humidityThreshold}
                  onChange={(e) =>
                    updateRackThreshold(
                      rackId,
                      "humidityThreshold",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* Validatie hint */}
              {t.tempThresholdHigh <= t.tempThresholdLow && (
                <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded p-2">
                  ⚠️ Maximale temperatuur moet hoger zijn dan minimale
                  temperatuur.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 2. Audio Instellingen */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">🔊</div>
          <h2 className="text-xl font-bold text-slate-100">Audio Instellingen</h2>
        </div>
        <p className="text-xs text-slate-500 -mt-4">
          Audio voorkeuren staan lokaal per apparaat opgeslagen (niet in de database).
        </p>

        {/* Audio aan/uit */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-slate-300 font-medium">Audio Alerts</label>
            <p className="text-slate-500 text-sm">
              Geluid afspelen bij kritieke temperatuur
            </p>
          </div>
          <button
            onClick={() => updateAudio("audioEnabled", !audio.audioEnabled)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              audio.audioEnabled ? "bg-green-600" : "bg-slate-600"
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                audio.audioEnabled ? "translate-x-6" : ""
              }`}
            />
          </button>
        </div>

        {/* Alarm volume */}
        {audio.audioEnabled && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-medium">Alarm Volume</label>
              <span className="text-slate-400 font-bold">{audio.alarmVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={audio.alarmVolume}
              onChange={(e) => updateAudio("alarmVolume", parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
          </div>
        )}

        {/* Notificatie geluiden */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-slate-300 font-medium">
              Notificatie Geluiden
            </label>
            <p className="text-slate-500 text-sm">
              Geluid bij bewegingsdetectie camera
            </p>
          </div>
          <button
            onClick={() =>
              updateAudio("notificationEnabled", !audio.notificationEnabled)
            }
            className={`relative w-14 h-8 rounded-full transition-colors ${
              audio.notificationEnabled ? "bg-green-600" : "bg-slate-600"
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                audio.notificationEnabled ? "translate-x-6" : ""
              }`}
            />
          </button>
        </div>

        {/* Notificatie volume */}
        {audio.notificationEnabled && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-medium">
                Notificatie Volume
              </label>
              <span className="text-slate-400 font-bold">
                {audio.notificationVolume}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={audio.notificationVolume}
              onChange={(e) =>
                updateAudio("notificationVolume", parseInt(e.target.value))
              }
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        )}

        {/* Test alarm button */}
        <button
          onClick={handleTestAlarm}
          disabled={!audio.audioEnabled}
          className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <span>🔔</span>
          Test Alarm Geluid
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-lg font-bold text-white transition-colors flex items-center justify-center gap-2"
        >
          {saveStatus === "saving" ? (
            <>
              <span className="animate-spin">⏳</span>
              Opslaan...
            </>
          ) : saveStatus === "saved" ? (
            <>
              <span>✅</span>
              Opgeslagen!
            </>
          ) : (
            <>
              <span>💾</span>
              Instellingen Opslaan
            </>
          )}
        </button>

        <button
          onClick={handleReset}
          className={`px-6 py-4 rounded-lg font-bold transition-colors ${
            resetConfirm
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-slate-700 hover:bg-slate-600 text-slate-300"
          }`}
        >
          {resetConfirm ? "⚠️ Bevestig Reset" : "🔄 Reset naar Standaard"}
        </button>
      </div>

      {/* Info footer */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-start gap-2 text-sm text-slate-400">
          <div>💡</div>
          <div>
            <strong className="text-slate-300">Tip:</strong> Rack drempelwaarden
            worden{" "}
            {isSupabaseEnabled
              ? "automatisch gesynchroniseerd met de Supabase database"
              : "lokaal in je browser opgeslagen. Verbind Supabase om waardes te delen tussen apparaten"}
            .
          </div>
        </div>
      </div>
    </div>
  );
}
