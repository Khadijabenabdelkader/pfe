{/*const db = require('../../connect');

const getAvis= (req, res) => {
 const { idSession } = req.params;

    const sql = `
      SELECT 
        avis.id_avis, avis.id_session, avis.id_participant, avis.commentaire, avis.note,
        avis.date_creation,avis.adaptation_programme_vie_pro
        ,avis.moyens_pedagogiques_utilises, avis.convenance_horaires_formation
        ,avis.apports_niveau_professionnel, avis.qualite_documentation_distribuee
        ,avis.maitrise_globale_sujets_presentes,avis.traitement_exemples_travail
        ,avis.animations_seances,avis.homogeneite_groupe
        ,avis.satisfaction_attentes,avis.duree_formation,
        participant.nom_complet ,participant.nature_participant, participant.nom_entreprise
      FROM avis
      JOIN participant ON avis.id_participant = participant.id_participant
      WHERE avis.id_session = ? ; `
  
    db.query(sql, [idSession], (err, results) => {
      if (err) {
        console.error("Erreur lors de la récupération des avis:", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "Aucun avis trouvé pour cette session." });
      }
      res.json(results);
    });
  };
  module.exports = {
    getAvis
  };*/}

  
  const avisService = require('../../services/admin/avis_participantService');

  class AvisController {
    async getAvis(req, res) {
      try {
        const { idSession } = req.params;
        const avis = await avisService.getAvisBySession(idSession);
        res.json(avis);
      } catch (error) {
        if (error.message === 'Aucun avis trouvé pour cette session') {
          return res.status(404).json({ message: error.message });
        }
        console.error("Erreur lors de la récupération des avis:", error);
        res.status(500).json({ error: error.message });
      }
    }
  }
  
  module.exports = new AvisController();