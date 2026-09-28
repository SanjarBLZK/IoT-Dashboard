import { useState, useEffect, useCallback, useRef } from "react";
import { AudioPreferences, RackThresholds } from "../types";
import { settingsService } from "../services/settingsService";
import { RACK_IDS } from "../config/racks";

/**
 * Drempelwaarden komen uit de `settings` tabel en zijn GEDEELD tussen alle
 * apparaten. Past iemand een waarde aan, dan zien de andere apparaten die
 * binnen `POLL_INTERVAL_MS`.
 *
 * Audio voorkeuren blijven wel lokaal: volume is een eigenschap van het
 * apparaat waarop je zit, niet van de serverruimte. Ze staan daarom ook niet
 * in de database.
 */

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

const AUDIO_STORAGE_KEY = "iot-dashboard-audio-preferences";

// Hoe vaak we controleren of iemand anders de drempelwaarden heeft gewijzigd.
const POLL_INTERVAL_MS = 10_000;

export type SyncStatus = "idle" | "syncing" | "synced" | "error";

function buildDefaultThresholds(): Record<number, RackThresholds> {
  const result: Record<number, RackThresholds> = {};
  for (const rackId of RACK_IDS) {
    result[rackId] = { rackId, ...DEFAULT_THRESHOLDS };
  }
  return result;
}

function readLocalAudio(): AudioPreferences {
  try {
    const raw = localStorage.getItem(AUDIO_STORAGE_KEY);
    if (!raw) return DEFAULT_AUDIO;
    return { ...DEFAULT_AUDIO, ...(JSON.parse(raw) as Partial<AudioPreferences>) };
  } catch (err) {
    console.warn("Kon audio voorkeuren niet lezen:", err);
    return DEFAULT_AUDIO;
  }
}

export function useSettings() {
  const [rackThresholds, setRackThresholds] = useState<
    Record<number, RackThresholds>
  >(() => buildDefaultThresholds());
  const [audio, setAudio] = useState<AudioPreferences>(() => readLocalAudio());

  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");

  // Voorkomt dat een poll-resultaat een wijziging overschrijft die de
  // gebruiker net heeft gedaan maar nog onderweg is naar de server.
  const pendingWrites = useRef(0);

  const refresh = useCallback(async () => {
    if (pendingWrites.current > 0) return;

    try {
      const fromServer = await settingsService.getAll();
      if (Object.keys(fromServer).length > 0) {
        // Merge met defaults, zodat een rack zonder rij toch een waarde heeft.
        setRackThresholds({ ...buildDefaultThresholds(), ...fromServer });
      }
    } catch (err) {
      console.warn("Kon drempelwaarden niet ophalen:", err);
    }
  }, []);

  // Eerste keer laden.
  useEffect(() => {
    let active = true;

    (async () => {
      await refresh();
      if (active) setIsLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [refresh]);

  // Blijven pollen, zodat wijzigingen van andere apparaten binnenkomen.
  useEffect(() => {
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  // Audio voorkeuren lokaal bewaren.
  useEffect(() => {
    try {
      localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(audio));
    } catch (err) {
      console.warn("Kon audio voorkeuren niet opslaan:", err);
    }
  }, [audio]);

  /**
   * Werk een drempelwaarde bij. De UI reageert direct (optimistisch), daarna
   * gaat de wijziging naar de server. Mislukt dat, dan draaien we terug.
   */
  const updateRackThreshold = useCallback(
    async <K extends keyof Omit<RackThresholds, "rackId">>(
      rackId: number,
      key: K,
      value: RackThresholds[K]
    ) => {
      const current =
        rackThresholds[rackId] ?? ({ rackId, ...DEFAULT_THRESHOLDS } as RackThresholds);
      const updated: RackThresholds = { ...current, [key]: value };

      setRackThresholds((prev) => ({ ...prev, [rackId]: updated }));

      pendingWrites.current += 1;
      setSyncStatus("syncing");

      try {
        const saved = await settingsService.update(updated);
        setRackThresholds((prev) => ({ ...prev, [rackId]: saved }));
        setSyncStatus("synced");
        setTimeout(() => setSyncStatus("idle"), 2000);
      } catch (err) {
        // Terugdraaien: de server heeft de wijziging niet geaccepteerd.
        setRackThresholds((prev) => ({ ...prev, [rackId]: current }));
        setSyncStatus("error");
        console.error("Kon drempelwaarde niet opslaan:", err);
        setTimeout(() => setSyncStatus("idle"), 3000);
      } finally {
        pendingWrites.current -= 1;
      }
    },
    [rackThresholds]
  );

  const updateAudio = useCallback(
    <K extends keyof AudioPreferences>(key: K, value: AudioPreferences[K]) => {
      setAudio((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  /** Zet alles terug naar de standaardwaarden, ook op de server. */
  const resetAll = useCallback(async () => {
    setAudio(DEFAULT_AUDIO);
    try {
      localStorage.removeItem(AUDIO_STORAGE_KEY);
    } catch {
      // niet kritisch
    }

    pendingWrites.current += 1;
    setSyncStatus("syncing");

    try {
      const defaults = buildDefaultThresholds();
      await Promise.all(
        Object.values(defaults).map((thresholds) =>
          settingsService.update(thresholds)
        )
      );
      setRackThresholds(defaults);
      setSyncStatus("synced");
      setTimeout(() => setSyncStatus("idle"), 2000);
    } catch (err) {
      console.error("Kon instellingen niet resetten:", err);
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("idle"), 3000);
    } finally {
      pendingWrites.current -= 1;
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
  };
}
