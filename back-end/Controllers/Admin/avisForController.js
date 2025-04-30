{/*const db = require('../../connect');

const getAvisFormateur= (req, res) => {
 const { idSession } = req.params;

    const sql = `
    SELECT a.*, s.theme
FROM avis_formateur a
JOIN session s ON a.id_session = s.id_session
WHERE a.id_session = ? ;`
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
    getAvisFormateur
  };*/}
  const avisFormateurService = require('../../services/admin/avis_formateur');

class AvisFormateurController {
  async getAvisFormateur(req, res) {
    try {
      const { idSession } = req.params;
      const avis = await avisFormateurService.getAvisBySession(idSession);
      res.json(avis);
    } catch (error) {
      if (error.message === 'Aucun avis trouvé pour cette session') {
        return res.status(404).json({ message: error.message });
      }
      console.error("Erreur lors de la récupération des avis:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async createAvisFormateur(req, res) {
    try {
      const avisId = await avisFormateurService.createAvis(req.body);
      res.status(201).json({ id_avis: avisId });
    } catch (error) {
      console.error("Erreur lors de la création de l'avis:", error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new AvisFormateurController();