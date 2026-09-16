import { supabase, isSupabaseEnabled } from '../lib/supabaseClient'
import { Incident } from '../types'

/**
 * Service voor het opslaan en ophalen van incidents
 * Werkt met of zonder Supabase configuratie
 */
export const incidentService = {
  /**
   * Sla een nieuw incident op in Supabase
   * Returns: true als succesvol, false als gefaald
   */
  async saveIncident(incident: Omit<Incident, 'id'>): Promise<boolean> {
    // Check of Supabase is geconfigureerd
    if (!isSupabaseEnabled()) {
      console.log('📝 Supabase niet geconfigureerd - incident alleen lokaal opgeslagen')
      return false
    }

    try {
      // Map frontend incident type naar database format
      const { data, error } = await supabase!
        .from('incidents')
        .insert({
          type: incident.type,
          rack_id: incident.rack || null,
          message: incident.message,
          photo_url: incident.photo || null,
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
   * Haal recente incidents op uit Supabase
   * Returns: Array van incidents, of null als gefaald
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

      // Map database format naar frontend format
      return data.map((item) => ({
        id: item.id,
        time: new Date(item.timestamp).toLocaleString('nl-NL'),
        type: item.type as 'motion' | 'alarm' | 'resolved',
        rack: item.rack_id || undefined,
        message: item.message,
        photo: item.photo_url || undefined,
      }))
    } catch (err) {
      console.error('❌ Onverwachte fout bij ophalen incidents:', err)
      return null
    }
  },

  /**
   * Subscribe to real-time incident updates
   * Returns: Unsubscribe function
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
          const newIncident = payload.new
          callback({
            id: newIncident.id,
            time: new Date(newIncident.timestamp).toLocaleString('nl-NL'),
            type: newIncident.type,
            rack: newIncident.rack_id || undefined,
            message: newIncident.message,
            photo: newIncident.photo_url || undefined,
          })
        }
      )
      .subscribe()

    // Return unsubscribe function
    return () => {
      supabase!.removeChannel(channel)
    }
  },
}
