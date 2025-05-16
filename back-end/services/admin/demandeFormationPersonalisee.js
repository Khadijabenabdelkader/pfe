const demandeFormationRepository = require('../../repositories/admin/demandeFormationRepository');
const DemandeFormation = require('../../models/admin/demande_formation_personalisee')
class DemandeFormationService {
  async getAllDemandes() {
    try {
      return await demandeFormationRepository.getAll();
    } catch (error) {
      console.error('Erreur dans DemandeFormationService:', error);
      throw new Error('Échec de la récupération des demandes');
    }
  }async getAllDemandesWithParticipants() {
    try {
      const results = await demandeFormationRepository.getAllWithParticipants();
      return results;
    } catch (error) {
      console.error('Erreur service:', error);
      throw error;
    }
  }
}

// Exportez bien une instance
module.exports = new DemandeFormationService();