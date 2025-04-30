const demandeFormationRepository = require('../../repositories/admin/demandeFormationRepository');

class DemandeFormationService {
  async getAllDemandes() {
    try {
      return await demandeFormationRepository.getAll();
    } catch (error) {
      console.error('Erreur dans DemandeFormationService:', error);
      throw new Error('Échec de la récupération des demandes');
    }
  }
}

// Exportez bien une instance
module.exports = new DemandeFormationService();