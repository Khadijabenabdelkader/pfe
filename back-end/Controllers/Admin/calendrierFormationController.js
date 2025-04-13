
const db = require('../../connect');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });
    
  const createCalendrierformation = async (req, res) => {
    const data = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ error: "Les données doivent être un tableau." });
    }
    const id_cal = Date.now(); 
    const values = data.map((item) => [
      id_cal, 
      item.id_domaine,
      item.id_session,
      item.nbj,
      item.mois,
      item.date_debut,
      item.date_fin,
    ]);
      const query =
      "INSERT INTO calendrierformation (id_cal, id_domaine, id_session, nbj, mois, date_debut, date_fin) VALUES ?";
  
    db.query(query, [values], (err, results) => {
      if (err) {
        console.error("Erreur lors de l'insertion des données :", err);
        return res.status(500).json({ error: "Erreur serveur lors de l'insertion des données." });
      }
        res.json({ message: "Calendrier sauvegardé avec succès", id_cal ,rowsAffected: results.affectedRows });
    });
  };

  
  // Suppression d'une session d'un calendrier
const deleteSessionFromCalendrier = async (req, res) => {
  const { id_cal, id_session } = req.params;

  const query = "DELETE FROM calendrierformation WHERE id_cal = ? AND id_session = ?";
  
  db.query(query, [id_cal, id_session], (err, results) => {
    if (err) {
      console.error("Erreur lors de la suppression de la session :", err);
      return res.status(500).json({ error: "Erreur serveur lors de la suppression." });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Session non trouvée dans ce calendrier." });
    }
    
    res.json({ message: "Session supprimée avec succès", rowsAffected: results.affectedRows });
  });
};

// Ajout d'une session à un calendrier
const addSessionToCalendrier = async (req, res) => {
  const { id_cal } = req.params;
  const { id_domaine, id_session, nbj, mois, date_debut, date_fin } = req.body;

  if (!id_domaine || !id_session || !mois || !date_debut || !date_fin) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires." });
  }

  const query = `
    INSERT INTO calendrierformation 
    (id_cal, id_domaine, id_session, nbj, mois, date_debut, date_fin) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, [id_cal, id_domaine, id_session, nbj, mois, date_debut, date_fin], (err, results) => {
    if (err) {
      console.error("Erreur lors de l'ajout de la session :", err);
      return res.status(500).json({ error: "Erreur serveur lors de l'ajout." });
    }
    
    res.json({ 
      message: "Session ajoutée avec succès", 
      id_cal,
      id_session,
      rowsAffected: results.affectedRows 
    });
  });
};


  const deleteCalendrierFormation = (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }
  
    const { id } = req.params;
    const createdBy = req.user.nom_admin; 
    db.query(
      "DELETE FROM calendrierformation WHERE id_cal = ? AND created_by = ?",
      [id, createdBy],
      (err, results) => {
        if (err) {
          console.error("Erreur lors de la suppression du calendrier :", err);
          return res.status(500).json({ error: "Erreur serveur" });
        }
        if (results.affectedRows === 0) {
          return res
            .status(403)
            .json({ error: "Vous ne pouvez supprimer que vos propres calendriers" });
        }
        res.status(200).json({ message: "Calendrier supprimé avec succès" });
      }
    );
  };
    
   
 
    
const getcalformation=(req, res) => {
    const id_cal = req.params.id_cal;
    const query = `
      SELECT cf.*, s.theme, s.code,formation.domaine, f.nom_complet AS formateur_nom
      FROM calendrierformation cf

      LEFT JOIN session s ON cf.id_session = s.id_session
      LEFT JOIN formation ON cf.id_domaine = formation.id_formation
      LEFT JOIN formateur f ON s.id_formateur = f.id_formateur
      WHERE cf.id_cal = ?
    `;
    db.query(query, [id_cal], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  };
  


  
  module.exports = {
    createCalendrierformation,
    deleteCalendrierFormation,
    getcalformation,
    deleteSessionFromCalendrier,
    addSessionToCalendrier
   
  };