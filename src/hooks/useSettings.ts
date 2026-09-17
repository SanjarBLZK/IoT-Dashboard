import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseEnabled } from "../lib/supabaseClient";
import { AudioPreferences, RackThresholds } from "../types";

// ============================================================================
// Defaults
// ============================================================================

// Rack IDs die het dashboard hanteert. Alle drie krijgen een default rij in de
// `settings` tabel via het schema.
export const RACK_IDS = [1, 2, 3] as const;

export const DEFAULT_THRESHOLDS: Omit<RackThresholds, "rackId"> = {
  tempThresholdHigh: 35.0,
  tempThresholdLow: 15.0,
  humidityThreshold: 60.0,
};

export const DEFAULT_AUDIO: AudioPreferences = {
  audioEnabled: true,
  alarmVolume: 15,
  notificationEnabled: true,
  notificationVolume: 10,
};

const RACK_STORAGE_KEY = "iot-dashboard-rack-thresholds";
const AUDIO_STORAGE_KEY = "iot-dashboard-audio-preferences";

// ============================================================================
// Helpers
// ============================================================================

function buildDefaultThresholds(): Record<number, RackThresholds> {
  const result: Record<number, RackThresholds> = {};
  for (const rackId of RACK_IDS) {
    result[rackId] = { rackId, ...DEFAULT_THRESHOLDS };
  }
  return result;
}

function readLocalThresholds(): Record<number, RackThresholds> {
  try {
    const raw = localStorage.getItem(RACK_STORAGE_KEY);
    if (!raw) return buildDefaultThresholds();
    const parsed = JSON.parse(raw) as Record<number, RackThresholds>;
    // Merge met defaults zodat ontbrekende racks/velden worden aangevuld.
    const merged = buildDefaultThresholds();
    for (const rackId of RACK_IDS) {
      merged[rackId] = { ...merged[rackId], ...(parsed[rackId] ?? {}) };
    }
    return merged;
  } catch (err) {
    console.warn("Kon rack thresholds niet lezen uit localStorage:", err);
    return buildDefaultThresholds();
  }
}

function readLocalAudio(): AudioPreferences {
  try {
    const raw = localStorage.getItem(AUDIO_STORAGE_KEY);
    if (!raw) return DEFAULT_AUDIO;
    return { ...DEFAULT_AUDIO, ...(JSON.parse(raw) as Partial<AudioPreferences>) };
  } catch (err) {
    console.warn("Kon audio voorkeuren niet lezen uit localStorage:", err);
    return DEFAULT_AUDIO;
  }
}

// ============================================================================
// Hook
// ============================================================================

export type SyncStatus = "idle" | "syncing" | "synced" | "error";

/**
 * `useSettings` levert:
 *  - `rackThresholds`: drempelwaarden per rack (uit Supabase `settings` tabel,
 *    met localStorage als fallback / cache).
 *  - `audio`: audio voorkeuren (uitsluitend lokaal, niet in de database).
 *
 * Wijzigingen worden gedebounced weggeschreven naar Supabase én naar
 * localStorage.
 */
export function useSettings() {
  const [rackThresholds, setRackThresholds] = useState<Record<number, RackThresholds>>(
    () => readLocalThresholds()
  );
  const [audio, setAudio] = useState<AudioPreferences>(() => readLocalAudio());

  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [hydrated, setHydrated] = useState(false);

  // -----------------------------
  // Load: settings uit Supabase
  // -----------------------------
  useEffect(() => {
    let cancelled = false;

    const loadFromSupabase = async () => {
      if (!isSupabaseEnabled()) {
        setHydrated(true);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase!
          .from("settings")
          .select("rack_id, temp_threshold_high, temp_threshold_low, humidity_threshold")
          .in("rack_id", RACK_IDS as unknown as number[]);

        if (error) throw error;
        if (cancelled) return;

        if (data && data.length > 0) {
          const merged = buildDefaultThresholds();
          for (const row of data) {
            merged[row.rack_id] = {
              rackId: row.rack_id,
              tempThresholdHigh: Number(row.temp_threshold_high),
              tempThresholdLow: Number(row.temp_threshold_low),
              humidityThreshold: Number(row.humidity_threshold),
            };
          }
          setRackThresholds(merged);
          localStorage.setItem(RACK_STORAGE_KEY, JSON.stringify(merged));
          console.log("✅ Rack settings geladen uit Supabase");
        } else {
          console.log("📋 Geen settings-rijen gevonden in Supabase, defaults in gebruik");
        }
      } catch (err) {
        console.warn("⚠️ Kon settings niet laden van Supabase:", err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setHydrated(true);
        }
      }
    };

    loadFromSupabase();
    return () => {
      cancelled = true;
    };
  }, []);

  // -----------------------------
  // Persist: rack thresholds
  // -----------------------------
  useEffect(() => {
    // Skip eerste render totdat we uit Supabase geladen hebben, zodat we niet
    // per ongeluk defaults over server-waarden heen schrijven.
    if (!hydrated) return;

    try {
      localStorage.setItem(RACK_STORAGE_KEY, JSON.stringify(rackThresholds));
    } catch (err) {
      console.warn("Kon rack thresholds niet opslaan in localStorage:", err);
    }

    if (!isSupabaseEnabled() || isLoading) return;

    const persist = async () => {
      try {
        setSyncStatus("syncing");
        const rows = Object.values(rackThresholds).map((t) => ({
          rack_id: t.rackId,
          temp_threshold_high: t.tempThresholdHigh,
          temp_threshold_low: t.tempThresholdLow,
          humidity_threshold: t.humidityThreshold,
          updated_at: new Date().toISOString(),
        }));

        const { error } = await supabase!
          .from("settings")
          .upsert(rows, { onConflict: "rack_id" });

        if (error) throw error;

        setSyncStatus("synced");
        console.log("💾 Rack settings opgeslagen naar Supabase");
        setTimeout(() => setSyncStatus("idle"), 2000);
      } catch (err) {
        console.error("❌ Kon rack settings niet opslaan naar Supabase:", err);
        setSyncStatus("error");
        setTimeout(() => setSyncStatus("idle"), 3000);
      }
    };

    // Kleine debounce zodat sliders niet elk frame een write triggeren.
    const timer = setTimeout(persist, 300);
    return () => clearTimeout(timer);
  }, [rackThresholds, hydrated, isLoading]);

  // -----------------------------
  // Persist: audio (localStorage only)
  // -----------------------------
  useEffect(() => {
    try {
      localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(audio));
    } catch (err) {
      console.warn("Kon audio voorkeuren niet opslaan in localStorage:", err);
    }
  }, [audio]);

  // -----------------------------
  // Updaters
  // -----------------------------
  const updateRackThreshold = useCallback(
    <K extends keyof Omit<RackThresholds, "rackId">>(
      rackId: number,
      key: K,
      value: RackThresholds[K]
    ) => {
      setRackThresholds((prev) => {
        const current = prev[rackId] ?? { rackId, ...DEFAULT_THRESHOLDS };
        return {
          ...prev,
          [rackId]: { ...current, [key]: value },
        };
      });
    },
    []
  );

  const updateAudio = useCallback(
    <K extends keyof AudioPreferences>(key: K, value: AudioPreferences[K]) => {
      setAudio((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetAll = useCallback(async () => {
    const defaults = buildDefaultThresholds();
    setRackThresholds(defaults);
    setAudio(DEFAULT_AUDIO);

    try {
      localStorage.removeItem(RACK_STORAGE_KEY);
      localStorage.removeItem(AUDIO_STORAGE_KEY);
    } catch (err) {
      console.warn("Kon instellingen niet verwijderen uit localStorage:", err);
    }

    if (isSupabaseEnabled()) {
      try {
        const rows = Object.values(defaults).map((t) => ({
          rack_id: t.rackId,
          temp_threshold_high: t.tempThresholdHigh,
          temp_threshold_low: t.tempThresholdLow,
          humidity_threshold: t.humidityThreshold,
          updated_at: new Date().toISOString(),
        }));
        await supabase!.from("settings").upsert(rows, { onConflict: "rack_id" });
        console.log("🔄 Rack settings gereset in Supabase");
      } catch (err) {
        console.warn("Kon settings niet resetten in Supabase:", err);
      }
    }
  }, []);

  return {
    rackThresholds,
    audio,
    updateRackThreshold,
    updateAudio,
    resetAll,
    isLoading,
    syncStatus,
    isSupabaseEnabled: isSupabaseEnabled(),
  };
}
