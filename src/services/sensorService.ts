import { api } from "./apiClient";

/** Ruwe meting zoals de API die teruggeeft. */
export interface SensorReading {
  timestamp: string;
  temperature: number;
  humidity: number;
}

/** Metingen gegroepeerd per rack id, oplopend in tijd. */
export type ReadingsByRack = Record<number, SensorReading[]>;

interface SensorsResponse {
  readings: ReadingsByRack;
  logLimit: number;
}

export const sensorService = {
  /**
   * Haal alle bewaarde metingen op, gegroepeerd per rack.
   *
   * De database bewaart maximaal 500 metingen in totaal; oudere zijn al
   * automatisch opgeruimd. De simulatie draait server-side, dus elk apparaat
   * krijgt exact dezelfde waarden.
   */
  async getReadings(): Promise<SensorsResponse> {
    return api.get<SensorsResponse>("/sensors");
  },
};
