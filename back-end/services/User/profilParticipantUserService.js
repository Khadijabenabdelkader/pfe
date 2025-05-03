const ProfilParticipantUserRepository = require('../../repositories/User/profilParticipantUserRepository');

class ProfilParticipantUserService {
    constructor() {
        this.repository = new ProfilParticipantUserRepository();
    }

    async getParticipantProfile(id_participant) {
        try {
            return await this.repository.getParticipantProfile(id_participant);
        } catch (error) {
            console.error("Service Error - getParticipantProfile:", error);
            throw error;
        }
    }

    async updateParticipantProfile(id_participant, updateData) {
        try {
            // Validation supplémentaire si nécessaire
            if (!id_participant || isNaN(id_participant)) {
                throw new Error('ID participant invalide');
            }
    
            // Appel au repository
            const result = await participantRepository.updateParticipantProfile(id_participant, updateData);
            
            // Vous pouvez ajouter ici des transformations des données si nécessaire
            return result;
    
        } catch (error) {
            console.error('Service Error - updateParticipantProfile:', error);
            
            // Différencier les types d'erreurs
            if (error.message.includes('obligatoires')) {
                throw new Error('Validation error: ' + error.message);
            }
            throw new Error('Échec de la mise à jour du profil: ' + error.message);
        }
    }
}

module.exports = ProfilParticipantUserService;