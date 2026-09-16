import { useState, useEffect } from "react";
import { supabase, isSupabaseEnabled } from "../lib/supabaseClient";

export interface Settings {
  // Temperatuur drempelwaarden
  warnTemp: number;
  criticalTemp: number;
  
  // Audio instellingen
  audioEnabled: boolean;
  alarmVolume: number;
  notificationEnabled: boolean;
  notificationVolume: number;
}

export const DEFAULT_SETTINGS: Settings = {
  warnTemp: 28,
  criticalTemp: 35,
  audioEnabled: true,
  alarmVolume: 15,
  notificationEnabled: true,
  notificationVolume: 10,
};

const STORAGE_KEY = "iot-dashboard-settings";

/**
 * Hook voor het ophalen en opslaan van gebruikersinstellingen
 * Gebruikt localStorage voor lokale persistentie EN Supabase voor server opslag
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

  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle");

  // Laad instellingen van Supabase bij opstarten
  useEffect(() => {
    const loadFromSupabase = async () => {
      if (!isSupabaseEnabled()) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase!
          .from('user_settings')
          .select('*')
          .single();

        if (error) {
          // Geen settings gevonden is OK, gebruik defaults
          if (error.code === 'PGRST116') {
            console.log('📋 Geen settings gevonden in database, gebruik defaults');
            return;
          }
          throw error;
        }

        if (data) {
          const serverSettings: Settings = {
            warnTemp: data.warn_temp,
            criticalTemp: data.critical_temp,
            audioEnabled: data.audio_enabled,
            alarmVolume: data.alarm_volume,
            notificationEnabled: data.notification_enabled,
            notificationVolume: data.notification_volume,
          };
          
          setSettings(serverSettings);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(serverSettings));
          console.log('✅ Settings geladen van Supabase');
        }
      } catch (error) {
        console.warn('⚠️ Kon settings niet laden van Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFromSupabase();
  }, []);

  // Sla op in localStorage EN Supabase bij wijziging
  useEffect(() => {
    const saveSettings = async () => {
      // Lokaal opslaan
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        console.warn("Kon instellingen niet opslaan in localStorage:", error);
      }

      // Server opslaan (indien Supabase enabled)
      if (isSupabaseEnabled() && !isLoading) {
        try {
          setSyncStatus("syncing");
          
          const { error } = await supabase!
            .from('user_settings')
            .upsert({
              id: 1, // Single user voor nu (kan later worden uitgebreid met auth)
              warn_temp: settings.warnTemp,
              critical_temp: settings.criticalTemp,
              audio_enabled: settings.audioEnabled,
              alarm_volume: settings.alarmVolume,
              notification_enabled: settings.notificationEnabled,
              notification_volume: settings.notificationVolume,
              updated_at: new Date().toISOString(),
            });

          if (error) throw error;
          
          setSyncStatus("synced");
          console.log('💾 Settings opgeslagen naar Supabase');
          
          // Reset status na 2 seconden
          setTimeout(() => setSyncStatus("idle"), 2000);
        } catch (error) {
          console.error('❌ Kon settings niet opslaan naar Supabase:', error);
          setSyncStatus("error");
          setTimeout(() => setSyncStatus("idle"), 3000);
        }
      }
    };

    saveSettings();
  }, [settings, isLoading]);

  const updateSetting = <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetSettings = async () => {
    setSettings(DEFAULT_SETTINGS);
    
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Kon instellingen niet verwijderen uit localStorage:", error);
    }

    // Reset ook in Supabase
    if (isSupabaseEnabled()) {
      try {
        await supabase!
          .from('user_settings')
          .delete()
          .eq('id', 1);
        console.log('🔄 Settings gereset in Supabase');
      } catch (error) {
        console.warn("Kon settings niet resetten in Supabase:", error);
      }
    }
  };

  return {
    settings,
    updateSetting,
    resetSettings,
    setSettings,
    isLoading,
    syncStatus,
    isSupabaseEnabled: isSupabaseEnabled(),
  };
}
