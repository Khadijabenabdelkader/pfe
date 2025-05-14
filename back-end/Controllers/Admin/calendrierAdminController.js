{/*const db = require('../../connect');

const getEvents = (req, res) => {
  db.query('SELECT * FROM calendrier', (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des événements :', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.status(200).json(results);
  });
};

const createEvent = (req, res) => {
  const { title, date, created_by } = req.body;
  const query = 'INSERT INTO calendrier (title, date, created_by) VALUES (?, ?, ?);'

  db.query(query, [title, date, created_by], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'ajout de l\'événement :', err);
      return res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'événement' });
    }

    const newEvent = {
      id: result.insertId, title,date, created_by, };

    return res.status(201).json(newEvent);
  });
};


const deleteEvent = (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }
  
    const { id } = req.params;
    const createdBy = req.user.nom_admin; // Récupération de l'utilisateur connecté
  
    db.query('DELETE FROM calendrier WHERE id = ? AND created_by = ?', [id, createdBy], (err, results) => {
      if (err) {
        console.error('Erreur lors de la suppression de l\'événement :', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      if (results.affectedRows === 0) {
        return res.status(403).json({ error: 'Vous ne pouvez supprimer que vos propres événements' });
      }
      res.status(200).json({ message: 'Événement supprimé avec succès' });
    });
  };


module.exports = { getEvents, createEvent, deleteEvent };*/}


const eventService = require('../../services/admin/calendrierEventService');

class EventController {
  async getEvents(req, res) {
            try {
              const events = await eventService.getEvents();
              res.status(200).json(events);
            } catch (error) {
              console.error('Controller Error - getEvents:', error);
              res.status(500).json({ error: error.message });
            }
          }
        
          async createEvent(req, res) {
            try {
              const { event, date, created_by } = req.body;
              
              if (!event || !date || !created_by) {
                return res.status(400).json({ error: 'Title, date and created_by are required' });
              }
        
              const newEvent = await eventService.createEvent({ event, date, created_by });
              res.status(201).json(newEvent);
            } catch (error) {
              console.error('Controller Error - createEvent:', error);
              res.status(500).json({ error: error.message });
            }
          }
        
         // Controller
// Controller
async deleteEvent(req, res) {
  try {
    // Extraction CORRECTE de id_event
    const id_event = req.params.id_event;

    if (!id_event) {
      return res.status(400).json({ error: 'ID manquant' });
    }

    if (!req.user?.nom_complet) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    const success = await eventService.deleteEvent(
      id_event,
      req.user.nom_complet
    );

    if (!success) {
      return res.status(404).json({ error: 'Événement non trouvé ou non autorisé' });
    }

    res.status(200).json({ message: 'Événement supprimé' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: error.message });
  }

}
}

module.exports = new EventController();