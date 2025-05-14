const eventRepository = require('../../repositories/admin/calendrierEventRepository');
const Event = require('../../models/admin/evenement');

class EventService {
  async getEvents() {
            try {
              return await eventRepository.getAllEvents();
            } catch (error) {
              console.error('Service Error - getEvents:', error);
              throw new Error('Failed to fetch events');
            }
          }
        
          async createEvent(eventData) {
            try {
              if (!eventData.event || !eventData.date || !eventData.created_by) {
                throw new Error('Missing required fields');
              }
        
              return await eventRepository.createEvent(
                eventData.event,
                eventData.date,
                eventData.created_by
              );
            } catch (error) {
              console.error('Service Error - createEvent:', error);
              throw new Error(`Failed to create event: ${error.message}`);
            }
          }
        
          // Service
async deleteEvent(id_event, nomComplet) {
    try {
        if (!nomComplet) {
            throw new Error('Le nom du créateur est requis');
        }

        
        const success = await eventRepository.deleteEvent(id_event, nomComplet);
        
        if (!success) {
            const exists = await eventRepository.eventExists(id_event);
            throw new Error(exists ? 'Non autorisé' : 'Événement non trouvé');
        }
        
        return { success: true };
    } catch (error) {
        console.error('Erreur service:', { 
            error: error.message,
            id_event,
            nomComplet
        });
        throw error;
    }

  }
}

module.exports = new EventService();