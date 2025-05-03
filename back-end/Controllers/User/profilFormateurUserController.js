const ProfilFormateurUserService = require('../../services/User/profilFormateurUserService');

class ProfilFormateurUserController {
    constructor() {
        this.service = new ProfilFormateurUserService();
    }

    /*async getFormateurDetails(req, res) {
      try {
          // Extraction correcte de l'ID depuis les paramètres de route
          const { id_formateur } = req.params;
          
          if (!id_formateur) {
              return res.status(400).json({ error: 'ID formateur requis' });
          }
  
          const formateur = await this.service.getFormateurDetails(id_formateur);
          res.json(formateur);
  
      } catch (error) {
          console.error('Controller Error - getFormateurDetails:', error);
          
          if (error.message.includes('non trouvé')) {
              res.status(404).json({ error: error.message });
          } else {
              res.status(500).json({ error: 'Erreur serveur' });
          }
      }
  }

    async getFormationsARealiser(req, res) {
        try {
            const { id_formateur } = req.params.id;
            const sessions = await this.service.getFormationsARealiser(id_formateur);
            
            res.json(sessions);

        } catch (error) {
            console.error('Controller Error - getFormationsARealiser:', error);
            
            if (error.message.includes('Aucune formation')) {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Erreur serveur' });
            }
        }
    }

    async getHistoriqueFormations(req, res) {
        try {
            const { id_formateur } = req.params.id;
            const sessions = await this.service.getHistoriqueFormations(id_formateur);
            
            res.json(sessions);

        } catch (error) {
            console.error('Controller Error - getHistoriqueFormations:', error);
            
            if (error.message.includes('Aucune formation')) {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Erreur serveur' });
            }
        }
    }

    async updatePassword(req, res) {
        try {
            const { id_formateur } = req.params.id;
            const { old_password, new_password } = req.body;
            
            const result = await this.service.updatePassword(id_formateur, old_password, new_password);
            res.json(result);

        } catch (error) {
            console.error('Controller Error - updatePassword:', error);
            
            if (error.message.includes('incorrect')) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Erreur serveur' });
            }
        }
    }*/

        async getProfile(req, res) {
            try {
                const { id_formateur } = req.params; // Assuming auth middleware adds user info
                const formateur = await this.service.getFormateurDetails(id_formateur);
                res.json(formateur);
            } catch (err) {
                console.error('FormateurController Error - getProfile:', err);
                res.status(err.message === 'Formateur not found' ? 404 : 500).json({
                    message: err.message || 'Error fetching formateur profile'
                });
            }
        }
    
        async getUpcomingSessions(req, res) {
            try {
                const { id_formateur } = req.params;
                const sessions = await this.service.getUpcomingSessions(id_formateur);
                res.json(sessions);
            } catch (err) {
                console.error('FormateurController Error - getUpcomingSessions:', err);
                res.status(500).json({ message: 'Error fetching upcoming sessions' });
            }
        }
    
        async getHistoricalSessions(req, res) {
            try {
                const { id_formateur } = req.params;
                const sessions = await this.service.getHistoricalSessions(id_formateur);
                res.json(sessions);
            } catch (err) {
                console.error('FormateurController Error - getHistoricalSessions:', err);
                res.status(500).json({ message: 'Error fetching historical sessions' });
            }
        }
    
        async changePassword(req, res) {
            try {
                const { id_formateur } = req.params;
                const { oldPassword, newPassword } = req.body;
                
                await this.service.updatePassword(id_formateur, oldPassword, newPassword);
                
                res.json({ message: 'Password updated successfully' });
            } catch (err) {
                console.error('FormateurController Error - changePassword:', err);
                const status = err.message.includes('not found') || err.message.includes('incorrect') ? 400 : 500;
                res.status(status).json({ message: err.message || 'Error updating password' });
            }
        }

    async getEvents(req, res) {
      try {
          const nom_complet = req.user.nom_complet;
          const events = await this.service.getEvents(nom_complet);
          res.json(events);
      } catch (err) {
          console.error('Controller Error - getEvents:', err);
          res.status(500).json({ error: err.message });
      }
  }

  async createEvent(req, res) {
      try {
          const eventData = {
              event: req.body.event,
              date: req.body.date,
              created_by: req.user.nom_complet
          };
          
          const newEvent = await this.service.createEvent(eventData);
          res.status(201).json(newEvent);
      } catch (err) {
          console.error('Controller Error - createEvent:', err);
          res.status(400).json({ error: err.message });
      }
  }

  async deleteEvent(req, res) {
      try {
          const id_event = parseInt(req.params.id_event);
          const created_by = req.user.nom_complet;
          
          await this.service.deleteEvent(id_event, created_by);
          res.json({ success: true });
      } catch (err) {
          console.error('Controller Error - deleteEvent:', err);
          res.status(400).json({ error: err.message });
      }
  }
    async sendModificationRequest(req, res) {
      try {
          const requestData = {
              ...req.body,
              fichiers: req.files?.fichiers
          };
          
          const result = await this.service.sendModificationRequest(requestData);
          res.status(200).json(result);

      } catch (error) {
          console.error('Controller Error - sendModificationRequest:', error);
          
          const statusCode = error.statusCode || 500;
          res.status(statusCode).json({
              success: false,
              error: error.message,
              details: process.env.NODE_ENV === 'development' ? error.stack : undefined
          });
      }
  }
  async handleModificationResponse(req, res) {
    try {
        const { token, decision, email } = req.query;
        
        const result = await this.service.handleModificationResponse(token, decision, email);

        res.send(`
            <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h1 style="color: ${decision === 'accept' ? 'green' : 'red'}">
                        Demande ${decision === 'accept' ? 'acceptée' : 'rejetée'} avec succès
                    </h1>
                    <p>Une notification a été envoyée au formateur.</p>
                </body>
            </html>
        `);

    } catch (error) {
        console.error('Controller Error - handleModificationResponse:', error);
        
        const statusCode = error.statusCode || 500;
        res.status(statusCode).send(`
            <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h1 style="color: red">Erreur</h1>
                    <p>${error.message}</p>
                </body>
            </html>
        `);
    }
}
}

module.exports = ProfilFormateurUserController;