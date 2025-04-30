const avisFormateurRepository = require('../../repositories/admin/avis_formateurRepository');
const AvisFormateur = require('../../models/admin/avis_f');

class AvisFormateurService {
  async getAvisBySession(idSession) {
    if (!idSession) {
      throw new Error('ID de session requis'); }
    const avis = await avisFormateurRepository.getBySession(idSession);
    
    if (avis.length === 0) {
      throw new Error('Aucun avis trouvé pour cette session');
    }

    return avis.map(a => a.toJSON()); // Sérialisation propre
  }

  async createAvis(avisData) {
    const avisId = await avisFormateurRepository.create(avisData);
    return { id_avis: avisId, ...avisData };
  }
}

module.exports = new AvisFormateurService();