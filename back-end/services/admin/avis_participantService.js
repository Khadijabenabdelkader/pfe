const avisRepository = require('../../repositories/admin/avis_participantRepository');

class AvisService {
  async getAvisBySession(idSession) {
    if (!idSession) {
      throw new Error('ID de session requis');
    }

    try {
      const avis = await avisRepository.getBySession(idSession);
      
      if (!avis || avis.length === 0) {
        throw new Error('Aucun avis trouvé pour cette session');
      }

      return avis;
    } catch (error) {
      console.error('Erreur dans AvisService.getAvisBySession:', error);
      throw error;
    }
  }
}

module.exports = new AvisService();
