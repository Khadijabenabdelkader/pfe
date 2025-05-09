const AvisFormateurService = require('../../services/User/AvisFormateurService');

class AvisFormateurController {
  constructor() {
    this.AvisFormateurService = new AvisFormateurService();
}
   async getThemesByFormateur(req, res) {
    try {
      const { idFormateur } = req.query;
      const results = await this.AvisFormateurService.getThemesByFormateur(idFormateur);
      res.json({ sessions: results });
    } catch (error) {
      console.error("Erreur :", error);
      res.status(error.message === 'ID formateur requis' ? 400 : 500).json({ 
        message: error.message || "Erreur serveur" 
      });
    }
  }

   async getFeuillePresence(req, res) {
    try {
      const { id_presence } = req.params;
      const presenceInfo = await this.AvisFormateurService.getFeuillePresence(id_presence);
      res.json(presenceInfo);
    } catch (error) {
      console.error("Erreur :", error);
      res.status(error.message === 'Aucune donnée trouvée pour cette présence' ? 404 : 500).json({ 
        error: error.message || "Erreur lors de la récupération des données" 
      });
    }
  }

   async getParticipantsByPresence(req, res) {
    try {
      const { id_presence } = req.query;
      const results = await this.AvisFormateurService.getParticipantsByPresence(id_presence);
      res.json(results);
    } catch (error) {
      console.error("Erreur :", error);
      res.status(error.message === 'ID de présence requis' ? 400 : 500).json({ 
        message: error.message || "Erreur serveur" 
      });
    }
  }

   async submitEvaluation(req, res) {
    try {
      const { evaluations, id_presence, id_formateur, organisme_formation } = req.body;

      const result = await this.AvisFormateurService.submitEvaluation(
        evaluations,
        id_presence,
        id_formateur,
        organisme_formation
      );

      res.json(result);
    } catch (error) {
      console.error('Erreur dans AvisFormateurController:', error);
      
      if (error.message === 'Données manquantes') {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(500).json({ 
        error: 'Erreur serveur',
        details: error.message 
      });
    }
  }
}

module.exports = AvisFormateurController;