// Status van een rack op basis van sensormetingen
export type RackStatus = "ok" | "warn" | "critical";

// Enkele sensor meting op een tijdstip
export interface RackReading {
  time: string;        // Tijdstempel (HH:MM formaat)
  temp: number;        // Temperatuur in °C
  humidity: number;    // Luchtvochtigheid in %
}

// Rack types
export type RackType = "server" | "network";

// Server rack met alle eigenschappen (client-side model; racks komen niet meer uit de database)
export interface Rack {
  id: number;                    // Uniek ID (1, 2, 3)
  name: string;                  // "Rack A", "Rack B", "Rack C"
  location: string;              // Fysieke positie
  type: RackType;                // "server" of "network"
  temp: number;                  // Huidige temperatuur
  humidity: number;              // Huidige luchtvochtigheid
  status: RackStatus;            // Afgeleide status
  history: RackReading[];        // Historische metingen (laatste 60)
  devices: string[];             // Apparaten in dit rack
}

// Incident types komen overeen met de database CHECK-constraint
// op incidents.type: 'beweging' | 'geluid' | 'temperatuur'.
export type IncidentType = "beweging" | "geluid" | "temperatuur";

// Incident model dat één-op-één matcht met de `incidents` tabel.
export interface Incident {
  id: number;
  time: string;                  // Weergavevorm van timestamp
  type: IncidentType;
  description: string;           // incidents.description
  imagePath?: string;            // incidents.image_path (optioneel)
}

// Drempelwaarden per rack (matcht de `settings` tabel).
export interface RackThresholds {
  rackId: number;                // settings.rack_id
  tempThresholdHigh: number;     // settings.temp_threshold_high
  tempThresholdLow: number;      // settings.temp_threshold_low
  humidityThreshold: number;     // settings.humidity_threshold
}

// Audio voorkeuren (lokaal per apparaat; niet in de database).
export interface AudioPreferences {
  audioEnabled: boolean;
  alarmVolume: number;           // 0-100
  notificationEnabled: boolean;
  notificationVolume: number;    // 0-100
}

// Ingelogde gebruiker (matcht de `users` tabel, zonder password_hash).
export interface AuthUser {
  id: number;                    // users.id
  username: string;              // users.username
  createdAt: string;             // users.created_at (ISO)
  lastLogin: string | null;      // users.last_login (ISO) of null
}
