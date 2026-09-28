import { Rack, RackReading, RackStatus, RackThresholds } from "../types";
import { RACK_CONFIG } from "../config/racks";
import { ReadingsByRack } from "../services/sensorService";

/**
 * Weergave-helpers.
 *
 * De sensorsimulatie zelf draait op de SERVER (server/src/simulator.js), zodat
 * alle apparaten dezelfde metingen en incidents zien. Dit bestand rekent de
 * API-data alleen om naar het model dat de componenten verwachten.
 */

// Marge (in °C) waarbinnen een temperatuur al als "warn" geldt.
// Moet gelijk blijven aan de waarde in server/src/simulator.js.
const WARN_MARGIN_C = 3;

// Marge (in %) voor luchtvochtigheid.
const HUMIDITY_WARN_MARGIN = 5;

// Aantal metingen dat de grafieken tonen.
const HISTORY_POINTS = 60;

/**
 * Leid de status af uit een meting en de drempelwaarden van dat rack.
 *
 * - critical : temp >= high, temp <= low, of humidity > drempel
 * - warn     : temp binnen WARN_MARGIN_C van een grens, of humidity
 *              binnen HUMIDITY_WARN_MARGIN van de drempel
 * - ok       : alles ruim binnen de marges
 */
export function deriveStatus(
  temp: number,
  humidity: number,
  thresholds: Pick<
    RackThresholds,
    "tempThresholdHigh" | "tempThresholdLow" | "humidityThreshold"
  >
): RackStatus {
  const { tempThresholdHigh, tempThresholdLow, humidityThreshold } = thresholds;

  if (temp >= tempThresholdHigh || temp <= tempThresholdLow) return "critical";
  if (humidity > humidityThreshold) return "critical";

  if (
    temp >= tempThresholdHigh - WARN_MARGIN_C ||
    temp <= tempThresholdLow + WARN_MARGIN_C ||
    humidity > humidityThreshold - HUMIDITY_WARN_MARGIN
  ) {
    return "warn";
  }

  return "ok";
}

/** Tijdstip als HH:MM, voor de x-as van de grafieken. */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Volledige datum en tijd, voor incident-tijdstempels. */
export function formatDateTime(date: Date): string {
  return date.toLocaleString("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Bouw de rack-lijst op uit de API-metingen, de rack-configuratie en de
 * gedeelde drempelwaarden.
 *
 * Racks waarvoor nog geen metingen bestaan komen er wel in te staan, met
 * status "ok" en lege historie. Zo blijft de layout stabiel terwijl de
 * eerste meting nog onderweg is.
 */
export function buildRacks(
  readingsByRack: ReadingsByRack,
  thresholds: Record<number, RackThresholds>
): Rack[] {
  return RACK_CONFIG.map((rackConfig) => {
    const readings = readingsByRack[rackConfig.id] ?? [];
    const recent = readings.slice(-HISTORY_POINTS);

    const history: RackReading[] = recent.map((reading) => ({
      time: formatTime(new Date(reading.timestamp)),
      temp: reading.temperature,
      humidity: reading.humidity,
    }));

    const latest = recent[recent.length - 1];
    const temp = latest?.temperature ?? 0;
    const humidity = latest?.humidity ?? 0;

    const rackThresholds = thresholds[rackConfig.id];
    const status: RackStatus =
      latest && rackThresholds
        ? deriveStatus(temp, humidity, rackThresholds)
        : "ok";

    return {
      id: rackConfig.id,
      name: rackConfig.name,
      location: rackConfig.location,
      type: rackConfig.type,
      temp,
      humidity,
      status,
      history,
      devices: rackConfig.devices,
    };
  });
}
