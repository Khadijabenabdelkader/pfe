const db = require('../../connect');

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
  };