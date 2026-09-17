import { useState } from "react";
import { useSettings } from "../hooks/useSettings";

interface SettingsPageProps {
  hasCritical: boolean;
  criticalRackNames: string;
  alertDismissed: boolean;
  onAlertDismiss: () => void;
  playAlertBeep: () => void;
}

export function SettingsPage({
  hasCritical,
  criticalRackNames,
  alertDismissed,
  onAlertDismiss,
  playAlertBeep,
}: SettingsPageProps) {
  const { settings, updateSetting, resetSettings, syncStatus, isSupabaseEnabled } = useSettings();
  
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [resetConfirm, setResetConfirm] = useState(false);
  const [showLiveUpdate, setShowLiveUpdate] = useState(false);

  // Toon live update feedback wanneer drempelwaarden veranderen
  const handleThresholdChange = (key: "warnTemp" | "criticalTemp", value: number) => {
    updateSetting(key, value);
    setShowLiveUpdate(true);
    setTimeout(() => setShowLiveUpdate(false), 2000);
  };

  const handleSave = () => {
    setSaveStatus("saving");
    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 500);
  };

  const handleReset = async () => {
    if (resetConfirm) {
      await resetSettings();
      setResetConfirm(false);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } else {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 3000);
    }
  };

  const handleTestAlarm = () => {
    if (settings.audioEnabled) {
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
          Pas het dashboard aan naar jouw voorkeuren
        </p>
        
        {/* Supabase Status Indicator */}
        {isSupabaseEnabled && (
          <div className="mt-4 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              syncStatus === "syncing" ? "bg-yellow-500 animate-pulse" :
              syncStatus === "synced" ? "bg-green-500" :
              syncStatus === "error" ? "bg-red-500" :
              "bg-slate-600"
            }`} />
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

      {/* Live Update Banner */}
      {showLiveUpdate && (
        <div className="bg-cyan-600/20 border border-cyan-500/50 rounded-lg p-4 flex items-center gap-3 animate-pulse">
          <div className="text-2xl">⚡</div>
          <div className="text-cyan-100 font-medium">
            Drempelwaarden direct toegepast! Check het dashboard voor wijzigingen.
          </div>
        </div>
      )}

      {/* 1. Temperatuur Drempelwaarden */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">🌡️</div>
          <h2 className="text-xl font-bold text-slate-100">
            Temperatuur Drempelwaarden
          </h2>
        </div>

        {/* Waarschuwingstemperatuur */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-slate-300 font-medium">
              Waarschuwingstemperatuur
            </label>
            <span className="text-orange-400 font-bold text-lg">
              {settings.warnTemp}°C
            </span>
          </div>
          <input
            type="range"
            min="20"
            max="40"
            step="0.5"
            value={settings.warnTemp}
            onChange={(e) => handleThresholdChange("warnTemp", parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <p className="text-slate-500 text-sm">
            Bij deze temperatuur wordt een oranje waarschuwing getoond
          </p>
        </div>

        {/* Kritieke temperatuur */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-slate-300 font-medium">
              Kritieke temperatuur
            </label>
            <span className="text-red-400 font-bold text-lg">
              {settings.criticalTemp}°C
            </span>
          </div>
          <input
            type="range"
            min="25"
            max="45"
            step="0.5"
            value={settings.criticalTemp}
            onChange={(e) => handleThresholdChange("criticalTemp", parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
          <p className="text-slate-500 text-sm">
            Bij deze temperatuur wordt een rode kritieke alert getriggerd met alarm
          </p>
        </div>

        {/* Info box */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <div className="text-blue-400 text-lg">ℹ️</div>
            <div className="text-xs text-blue-200">
              <strong>Let op:</strong> Zorg dat de kritieke temperatuur hoger is
              dan de waarschuwingstemperatuur voor correcte werking.
            </div>
          </div>
        </div>
      </div>

      {/* 2. Audio Instellingen */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">🔊</div>
          <h2 className="text-xl font-bold text-slate-100">Audio Instellingen</h2>
        </div>

        {/* Audio aan/uit */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-slate-300 font-medium">Audio Alerts</label>
            <p className="text-slate-500 text-sm">
              Geluid afspelen bij kritieke temperatuur
            </p>
          </div>
          <button
            onClick={() => updateSetting("audioEnabled", !settings.audioEnabled)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              settings.audioEnabled ? "bg-green-600" : "bg-slate-600"
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                settings.audioEnabled ? "translate-x-6" : ""
              }`}
            />
          </button>
        </div>

        {/* Alarm volume */}
        {settings.audioEnabled && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-medium">Alarm Volume</label>
              <span className="text-slate-400 font-bold">{settings.alarmVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={settings.alarmVolume}
              onChange={(e) => updateSetting("alarmVolume", parseInt(e.target.value))}
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
              updateSetting("notificationEnabled", !settings.notificationEnabled)
            }
            className={`relative w-14 h-8 rounded-full transition-colors ${
              settings.notificationEnabled ? "bg-green-600" : "bg-slate-600"
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                settings.notificationEnabled ? "translate-x-6" : ""
              }`}
            />
          </button>
        </div>

        {/* Notificatie volume */}
        {settings.notificationEnabled && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-medium">
                Notificatie Volume
              </label>
              <span className="text-slate-400 font-bold">
                {settings.notificationVolume}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={settings.notificationVolume}
              onChange={(e) =>
                updateSetting("notificationVolume", parseInt(e.target.value))
              }
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        )}

        {/* Test alarm button */}
        <button
          onClick={handleTestAlarm}
          disabled={!settings.audioEnabled}
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
            <strong className="text-slate-300">Tip:</strong> Alle instellingen
            worden automatisch opgeslagen {isSupabaseEnabled ? 
            "in je browser én gesynchroniseerd met de Supabase database voor gebruik op meerdere apparaten" : 
            "in je browser. Verbind Supabase om settings te synchroniseren tussen apparaten"}.
          </div>
        </div>
      </div>
    </div>
  );
}
