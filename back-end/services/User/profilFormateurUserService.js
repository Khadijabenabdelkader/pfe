const ProfilFormateurUserRepository = require('../../repositories/User/profilFormateurUserRepository');
const Formateur = require('../../models/admin/formateur');
const Event = require('../../models/admin/evenement');

class ProfilFormateurUserService {
    constructor() {
        this.repository = new ProfilFormateurUserRepository();
    }

    /*async getFormateurDetails(id_formateur) {
        try {
            
            return await this.repository.getFormateurDetails(id_formateur);

        } catch (error) {
            console.error('Service Error - getFormateurDetails:', error);
            throw error;
        }
    }

    async getFormationsARealiser(id_formateur) {
        try {
            if (!id_formateur) {
                throw new Error('ID formateur requis');
            }

            const sessions = await this.repository.getFormationsARealiser(id_formateur);
            
            if (sessions.length === 0) {
                throw new Error('Aucune formation à réaliser trouvée');
            }

            return sessions;

        } catch (error) {
            console.error('Service Error - getFormationsARealiser:', error);
            throw error;
        }
    }

    async getHistoriqueFormations(id_formateur) {
        try {
            if (!id_formateur) {
                throw new Error('ID formateur requis');
            }

            const sessions = await this.repository.getHistoriqueFormations(id_formateur);
            
            if (sessions.length === 0) {
                throw new Error('Aucune formation historique trouvée');
            }

            return sessions;

        } catch (error) {
            console.error('Service Error - getHistoriqueFormations:', error);
            throw error;
        }
    }

    async updatePassword(id_formateur, oldPassword, newPassword) {
        try {
            if (!id_formateur || !oldPassword || !newPassword) {
                throw new Error('Tous les champs sont requis');
            }

            await this.repository.updatePassword(id_formateur, oldPassword, newPassword);
            return { success: true, message: 'Mot de passe mis à jour avec succès' };

        } catch (error) {
            console.error('Service Error - updatePassword:', error);
            throw error;
        }
    }*/
        async getFormateurDetails(id_formateur) {
            try {
                const formateur = await this.repository.getById(id_formateur);
                if (!formateur) {
                    throw new Error('Formateur not found');
                }
                return formateur;
            } catch (err) {
                console.error('FormateurService Error - getFormateurDetails:', err);
                throw err;
            }
        }
    
        async getUpcomingSessions(id_formateur) {
            try {
                return await this.repository.getSessionsByStatus(id_formateur, 'A Realisé');
            } catch (err) {
                console.error('FormateurService Error - getUpcomingSessions:', err);
                throw err;
            }
        }
    
        async getHistoricalSessions(id_formateur) {
            try {
                return await this.repository.getSessionsByStatus(id_formateur, 'Déja Realisé');
            } catch (err) {
                console.error('FormateurService Error - getHistoricalSessions:', err);
                throw err;
            }
        }
    
        async updatePassword(id_formateur, oldPassword, newPassword) {
            try {
                const storedPassword = await this.repository.verifyPassword(id_formateur);
                if (!storedPassword) {
                    throw new Error('Formateur not found');
                }
    
                const isMatch = await bcrypt.compare(oldPassword, storedPassword);
                if (!isMatch) {
                    throw new Error('Current password is incorrect');
                }
    
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                const updated = await this.repository.updatePassword(id_formateur, hashedPassword);
                
                if (!updated) {
                    throw new Error('Password update failed');
                }
    
                return true;
            } catch (err) {
                console.error('FormateurService Error - updatePassword:', err);
                throw err;
            }
        }

    async getEvents(nom_complet) {
        try {
            return await this.repository.getEvents(nom_complet);
        } catch (err) {
            console.error('Service Error - getEvents:', err);
            throw err;
        }
    }

    async createEvent(eventData) {
        try {
            const event = new Event(eventData);
            event.validate();
            return await this.repository.createEvent(eventData);
        } catch (err) {
            console.error('Service Error - createEvent:', err);
            throw err;
        }
    }

    async deleteEvent(id_event, created_by) {
        try {
            return await this.repository.deleteEvent(id_event, created_by);
        } catch (err) {
            console.error('Service Error - deleteEvent:', err);
            throw err;
        }
    }

    async sendModificationRequest(requestData) {
        try {
            // Validation des données
            const requiredFields = ['telephone', 'nouveauxDonnes', 'nomFormateur', 'email'];
            for (const field of requiredFields) {
                if (!requestData[field]) {
                    throw new Error(`Le champ ${field} est requis`);
                }
            }

            return await this.repository.sendModificationRequest(requestData);

        } catch (error) {
            console.error('Service Error - sendModificationRequest:', error);
            
            // Enrichir l'erreur pour le controller
            const enrichedError = new Error(error.message);
            enrichedError.statusCode = error.message.includes('requis') ? 400 : 500;
            throw enrichedError;
        }
    }
    async handleModificationResponse(token, decision, email) {
        try {
            if (!token || !decision || !email) {
                throw new Error('Paramètres manquants');
            }

            if (!['accept', 'reject'].includes(decision)) {
                throw new Error('Décision invalide');
            }

            return await this.repository.handleModificationResponse(token, decision, email);

        } catch (error) {
            console.error('Service Error - handleModificationResponse:', error);
            
            // Enrichir l'erreur pour le controller
            error.statusCode = error.message.includes('Paramètres') ? 400 : 500;
            throw error;
        }
    }

}

module.exports = ProfilFormateurUserService;