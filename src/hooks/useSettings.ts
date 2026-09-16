import { useState, useEffect } from "react";

export interface Settings {
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

export const DEFAULT_SETTINGS: Settings = {
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

const STORAGE_KEY = "iot-dashboard-settings";

/**
 * Hook voor het ophalen en opslaan van gebruikersinstellingen
 * Gebruikt localStorage voor persistentie tussen sessies
 */
export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge met defaults voor nieuwe settings
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.warn("Kon instellingen niet laden uit localStorage:", error);
    }
    return DEFAULT_SETTINGS;
  });

  // Sla automatisch op bij wijziging
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn("Kon instellingen niet opslaan in localStorage:", error);
    }
  }, [settings]);

  const updateSetting = <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Kon instellingen niet verwijderen uit localStorage:", error);
    }
  };

  return {
    settings,
    updateSetting,
    resetSettings,
    setSettings,
  };
}
