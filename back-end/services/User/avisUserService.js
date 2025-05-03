const AvisUserRepository = require('../../repositories/User/avisUserRepository');
const Avis = require('../../models/admin/avis_p');

class AvisUserService {
    constructor() {
        this.repository = new AvisUserRepository();
    }

    async createAvis(avisData) {
        try {
            // Validation des données requises
            if (!avisData.id_participant || !avisData.id_session) {
                throw new Error('ID participant et ID session sont obligatoires');
            }

            // Création de l'avis
            const nouvelAvis = await this.repository.createAvis(avisData);
            return nouvelAvis;

        } catch (error) {
            console.error('Service Error - createAvis:', error);
            throw error;
        }
    }

    async getSessionsByParticipant(id_participant) {
        try {
            if (!id_participant) {
                throw new Error('ID participant requis');
            }

            const sessions = await this.repository.getSessionsByParticipant(id_participant);
            return sessions;

        } catch (error) {
            console.error('Service Error - getSessionsByParticipant:', error);
            throw error;
        }
    }
}

module.exports = AvisUserService;