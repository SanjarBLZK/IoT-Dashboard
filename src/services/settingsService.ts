import { api } from "./apiClient";
import { RackThresholds } from "../types";

/**
 * Drempelwaarden zijn GEDEELD tussen alle apparaten: er is een rij per rack
 * in de database, niet per gebruiker. Past iemand iets aan, dan zien de
 * andere apparaten dezelfde waarde zodra ze opnieuw ophalen.
 */

interface SettingsRow extends RackThresholds {
  updatedAt: string;
}

interface SettingsResponse {
  settings: SettingsRow[];
}

interface SingleSettingsResponse {
  settings: SettingsRow;
}

export const settingsService = {
  /** Alle drempelwaarden ophalen, gegroepeerd op rack id. */
  async getAll(): Promise<Record<number, RackThresholds>> {
    const { settings } = await api.get<SettingsResponse>("/settings");

    const byRack: Record<number, RackThresholds> = {};
    for (const row of settings) {
      byRack[row.rackId] = {
        rackId: row.rackId,
        tempThresholdHigh: row.tempThresholdHigh,
        tempThresholdLow: row.tempThresholdLow,
        humidityThreshold: row.humidityThreshold,
      };
    }
    return byRack;
  },

  /** Drempelwaarden van een rack bijwerken. Geldt direct voor alle apparaten. */
  async update(thresholds: RackThresholds): Promise<RackThresholds> {
    const { settings } = await api.put<SingleSettingsResponse>(
      `/settings/${thresholds.rackId}`,
      {
        tempThresholdHigh: thresholds.tempThresholdHigh,
        tempThresholdLow: thresholds.tempThresholdLow,
        humidityThreshold: thresholds.humidityThreshold,
      }
    );

    return {
      rackId: settings.rackId,
      tempThresholdHigh: settings.tempThresholdHigh,
      tempThresholdLow: settings.tempThresholdLow,
      humidityThreshold: settings.humidityThreshold,
    };
  },
};
