import { supabase, isSupabaseEnabled } from '../lib/supabaseClient'
import { Incident, IncidentType } from '../types'

/**
 * Service voor het opslaan en ophalen van incidents.
 *
 * Werkt met of zonder Supabase configuratie. Mapping tussen database rijen
 * en het frontend `Incident` type:
 *   incidents.id            -> Incident.id
 *   incidents.timestamp     -> Incident.time (gelokaliseerde string)
 *   incidents.type          -> Incident.type ('beweging' | 'geluid' | 'temperatuur')
 *   incidents.description   -> Incident.description
 *   incidents.image_path    -> Incident.imagePath
 */
export const incidentService = {
  /**
   * Sla een nieuw incident op in Supabase.
   * Returns: true als succesvol, false als gefaald.
   */
  async saveIncident(incident: Omit<Incident, 'id'>): Promise<boolean> {
    if (!isSupabaseEnabled()) {
      console.log('📝 Supabase niet geconfigureerd - incident alleen lokaal opgeslagen')
      return false
    }

    try {
      const { data, error } = await supabase!
        .from('incidents')
        .insert({
          type: incident.type,
          description: incident.description,
          image_path: incident.imagePath ?? null,
          timestamp: new Date().toISOString(),
        })
        .select()

      if (error) {
        console.error('❌ Fout bij opslaan incident in Supabase:', error.message)
        return false
      }

      console.log('✅ Incident opgeslagen in Supabase:', data)
      return true
    } catch (err) {
      console.error('❌ Onverwachte fout bij opslaan incident:', err)
      return false
    }
  },

  /**
   * Haal recente incidents op uit Supabase.
   * Returns: Array van incidents, of null als gefaald.
   */
  async getRecentIncidents(limit: number = 20): Promise<Incident[] | null> {
    if (!isSupabaseEnabled()) {
      return null
    }

    try {
      const { data, error } = await supabase!
        .from('incidents')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('❌ Fout bij ophalen incidents:', error.message)
        return null
      }

      return data.map((row) => ({
        id: row.id,
        time: new Date(row.timestamp).toLocaleString('nl-NL'),
        type: row.type as IncidentType,
        description: row.description,
        imagePath: row.image_path ?? undefined,
      }))
    } catch (err) {
      console.error('❌ Onverwachte fout bij ophalen incidents:', err)
      return null
    }
  },

  /**
   * Subscribe naar real-time incident updates.
   * Returns: unsubscribe functie.
   */
  subscribeToIncidents(
    callback: (incident: Incident) => void
  ): (() => void) | null {
    if (!isSupabaseEnabled()) {
      return null
    }

    const channel = supabase!
      .channel('incidents_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'incidents',
        },
        (payload) => {
          const row = payload.new as {
            id: number
            timestamp: string
            type: IncidentType
            description: string
            image_path: string | null
          }
          callback({
            id: row.id,
            time: new Date(row.timestamp).toLocaleString('nl-NL'),
            type: row.type,
            description: row.description,
            imagePath: row.image_path ?? undefined,
          })
        }
      )
      .subscribe()

    return () => {
      supabase!.removeChannel(channel)
    }
  },
}
