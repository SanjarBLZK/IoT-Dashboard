import { RackType } from "../types";

/**
 * Weergave-informatie van de racks.
 *
 * Dit staat bewust NIET in de database: er zijn maar vier tabellen
 * (users, settings, sensor_data, incidents) en een rack is geen meetdata maar
 * inrichting van de ruimte. De database koppelt metingen aan een `rack_id`,
 * en dit bestand geeft daar een naam, locatie en apparatenlijst bij.
 *
 * Komt er een rack bij? Voeg hier een regel toe en zorg dat de backend
 * (server/src/config.js -> RACKS) hetzelfde id kent, zodat er metingen voor
 * worden aangemaakt.
 */

export interface RackConfig {
  id: number;
  name: string;
  location: string;
  type: RackType;
  devices: string[];
}

export const RACK_CONFIG: RackConfig[] = [
  {
    id: 1,
    name: "Rack A",
    location: "Noordzijde",
    type: "server",
    devices: [
      "Dell PowerEdge R740",
      "HP ProLiant DL380 Gen10",
      "Cisco Catalyst 9300",
      "NetApp FAS2750",
    ],
  },
  {
    id: 2,
    name: "Rack B",
    location: "Centrale rij",
    type: "network",
    devices: [
      "Cisco Nexus 9000",
      "Juniper EX4300",
      "Arista 7050X3",
      "Palo Alto PA-5220",
    ],
  },
  {
    id: 3,
    name: "Rack C",
    location: "Zuidzijde",
    type: "server",
    devices: [
      "HPE Apollo 6500 Gen10",
      "Dell PowerEdge R640",
      "EMC VNX5400",
      "Eaton 9PX UPS",
      "Dell PowerVault MD3400",
    ],
  },
];

/** Rack id's die het dashboard toont. */
export const RACK_IDS = RACK_CONFIG.map((rack) => rack.id);

/** Snelle lookup op id. */
export const RACK_BY_ID = new Map<number, RackConfig>(
  RACK_CONFIG.map((rack) => [rack.id, rack])
);
