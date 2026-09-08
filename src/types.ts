// Status van een rack op basis van temperatuur
export type RackStatus = "ok" | "warn" | "critical";

// Enkele sensor meting op een tijdstip
export interface RackReading {
  time: string;        // Tijdstempel (HH:MM formaat)
  temp: number;        // Temperatuur in °C
  humidity: number;    // Luchtvochtigheid in %
}

// Server rack met alle eigenschappen
export interface Rack {
  id: number;                    // Uniek ID (1, 2, 3)
  name: string;                  // "Rack A", "Rack B", "Rack C"
  location: string;              // Fysieke positie
  temp: number;                  // Huidige temperatuur
  humidity: number;              // Huidige luchtvochtigheid
  status: RackStatus;            // Afgeleide status
  history: RackReading[];        // Historische metingen (laatste 60)
  devices: string[];             // Apparaten in dit rack
}

// Incident types
export interface Incident {
  id: number;
  time: string;
  type: "motion" | "alarm" | "resolved";
  rack?: number;                 // Optioneel: welke rack
  message: string;
  photo?: string;                // URL naar foto (bij bewegingsdetectie)
}
