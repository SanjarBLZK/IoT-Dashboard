import { api } from "./apiClient";
import { Incident, IncidentType } from "../types";

/**
 * Incidents komen uit de database via de API. Ze worden server-side
 * aangemaakt (bewegingsdetectie en drempeloverschrijdingen), zodat alle
 * apparaten dezelfde gebeurtenissen zien met dezelfde database-ID's.
 */

interface ApiIncident {
  id: number;
  timestamp: string;
  type: IncidentType;
  description: string;
  imagePath: string | null;
}

interface IncidentsResponse {
  incidents: ApiIncident[];
}

function toIncident(row: ApiIncident): Incident {
  return {
    id: row.id,
    time: new Date(row.timestamp).toLocaleString("nl-NL"),
    type: row.type,
    description: row.description,
    imagePath: row.imagePath ?? undefined,
  };
}

export const incidentService = {
  /** Meest recente incidents ophalen (nieuwste eerst). */
  async getRecentIncidents(limit: number = 50): Promise<Incident[]> {
    const { incidents } = await api.get<IncidentsResponse>(
      `/incidents?limit=${limit}`
    );
    return incidents.map(toIncident);
  },

  /**
   * Handmatig een incident vastleggen.
   * De simulator doet dit normaal automatisch op de server.
   */
  async createIncident(
    type: IncidentType,
    description: string,
    imagePath?: string
  ): Promise<Incident> {
    const { incident } = await api.post<{ incident: ApiIncident }>(
      "/incidents",
      { type, description, imagePath: imagePath ?? null }
    );
    return toIncident(incident);
  },
};
