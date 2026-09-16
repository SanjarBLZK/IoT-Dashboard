import { useState, useEffect } from "react";

interface SettingsPageProps {
  hasCritical: boolean;
  criticalRackNames: string;
  alertDismissed: boolean;
  onAlertDismiss: () => void;
  playAlertBeep: () => void;
}

interface Settings {
  // Temperatuur drempelwaarden
  warnTemp: number;
  criticalTemp: number;
  
  // Audio instellingen
  audioEnabled: boolean;
  alarmVolume: number;
  notificationEnabled: boolean;
  notificationVolume: number;
  
  // Display instellingen
  darkMode: boolean;
  updateInterval: number; // in seconden
  historyPoints: number;
  incidentListLength: number;
  colorTheme: "blue" | "purple" | "green" | "red";
}

const DEFAULT_SETTINGS: Settings = {
  warnTemp: 28,
  criticalTemp: 35,
  audioEnabled: true,
  alarmVolume: 15,
  notificationEnabled: true,
  notificationVolume: 10,
  darkMode: true,
  updateInterval: 60,
  historyPoints: 60,
  incidentListLength: 20,
  colorTheme: "blue",
};

export function SettingsPage({
  hasCritical,
  criticalRackNames,
  alertDismissed,
  onAlertDismiss,
  playAlertBeep,
}: SettingsPageProps) {
  const [settings, setSettings] = useState<Settings>(() => {
    // Laad instellingen uit localStorage
    const saved = localStorage.getItem("iot-dashboard-settings");
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });
  
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [resetConfirm, setResetConfirm] = useState(false);

  // Sla instellingen op in localStorage bij wijziging
  useEffect(() => {
    localStorage.setItem("iot-dashboard-settings", JSON.stringify(settings));
  }, [settings]);

  const handleSave = () => {
    setSaveStatus("saving");
    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 500);
  };

  const handleReset = () => {
    if (resetConfirm) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.removeItem("iot-dashboard-settings");
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
      playAlertBeep(settings.alarmVolume);
    }
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
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
            onChange={(e) => updateSetting("warnTemp", parseFloat(e.target.value))}
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
            onChange={(e) => updateSetting("criticalTemp", parseFloat(e.target.value))}
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

      {/* 3. Display Instellingen */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">🎨</div>
          <h2 className="text-xl font-bold text-slate-100">Display Instellingen</h2>
        </div>

        {/* Dark mode toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-slate-300 font-medium">Dark Mode</label>
            <p className="text-slate-500 text-sm">Donker kleurenschema (standaard)</p>
          </div>
          <button
            onClick={() => updateSetting("darkMode", !settings.darkMode)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              settings.darkMode ? "bg-slate-700" : "bg-blue-600"
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                settings.darkMode ? "translate-x-6" : ""
              }`}
            />
          </button>
        </div>

        {/* Update interval */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-slate-300 font-medium">
              Sensor Update Interval
            </label>
            <span className="text-slate-400 font-bold">
              {settings.updateInterval}s
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[5, 30, 60, 300].map((seconds) => (
              <button
                key={seconds}
                onClick={() => updateSetting("updateInterval", seconds)}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  settings.updateInterval === seconds
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {seconds < 60 ? `${seconds}s` : `${seconds / 60}m`}
              </button>
            ))}
          </div>
          <p className="text-slate-500 text-sm">
            Hoe vaak sensor data wordt vernieuwd (simulatie)
          </p>
        </div>

        {/* History points */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-slate-300 font-medium">
              Grafiek Datapunten
            </label>
            <span className="text-slate-400 font-bold">
              {settings.historyPoints}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[30, 60, 120].map((points) => (
              <button
                key={points}
                onClick={() => updateSetting("historyPoints", points)}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  settings.historyPoints === points
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {points}
              </button>
            ))}
          </div>
          <p className="text-slate-500 text-sm">
            Aantal historische datapunten in grafieken
          </p>
        </div>

        {/* Incident list length */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-slate-300 font-medium">
              Incident Geschiedenis
            </label>
            <span className="text-slate-400 font-bold">
              {settings.incidentListLength}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[10, 20, 50, 100].map((length) => (
              <button
                key={length}
                onClick={() => updateSetting("incidentListLength", length)}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  settings.incidentListLength === length
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {length}
              </button>
            ))}
          </div>
          <p className="text-slate-500 text-sm">
            Maximum aantal incidents in het logboek
          </p>
        </div>

        {/* Color theme (preview voor toekomstige feature) */}
        <div className="space-y-3">
          <label className="text-slate-300 font-medium">Kleurthema</label>
          <div className="grid grid-cols-4 gap-2">
            {(["blue", "purple", "green", "red"] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => updateSetting("colorTheme", theme)}
                className={`px-3 py-2 rounded-lg font-medium transition-colors capitalize ${
                  settings.colorTheme === theme
                    ? `bg-${theme}-600 text-white`
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                } ${
                  theme === "blue"
                    ? "bg-blue-600"
                    : theme === "purple"
                    ? "bg-purple-600"
                    : theme === "green"
                    ? "bg-green-600"
                    : "bg-red-600"
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
          <p className="text-slate-500 text-sm">
            Accent kleur voor het dashboard (experimenteel)
          </p>
        </div>
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
            worden lokaal opgeslagen in je browser. Bij gebruik van Supabase
            database kunnen instellingen in de toekomst gesynchroniseerd worden
            tussen apparaten.
          </div>
        </div>
      </div>
    </div>
  );
}
