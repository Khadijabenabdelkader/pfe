
const db = require('../../connect');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });
   {/* 
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
*/}
  
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
  

{/*
  
  module.exports = {
    createCalendrierformation,
    deleteCalendrierFormation,
    getcalformation,
    deleteSessionFromCalendrier,
    addSessionToCalendrier
   
  };*/}
































  const createCalendrierformation = async (req, res) => {
    // Vérification que la requête contient un tableau
    if (!req.body || !Array.isArray(req.body)) {
        return res.status(400).json({
            success: false,
            message: "Format de requête invalide. Un tableau de sessions est attendu.",
            error_code: "INVALID_REQUEST_FORMAT"
        });
    }

    // Vérification que le tableau n'est pas vide
    if (req.body.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Aucune donnée à traiter",
            error_code: "EMPTY_DATA_ARRAY"
        });
    }

    const errors = [];
    const successfulUpdates = [];

    try {
        // Traitement de chaque session dans le tableau
        for (const [index, sessionData] of req.body.entries()) {
            try {
                // Validation des champs obligatoires
                if (!sessionData.id_session) {
                    throw new Error("Le champ 'id_session' est obligatoire pour la mise à jour");
                }

                if (!sessionData.date_debut || !sessionData.date_fin) {
                    throw new Error("Les champs 'date_debut' et 'date_fin' sont obligatoires");
                }

                // Validation du format des dates
                let startDate, endDate;
                
                try {
                    startDate = new Date(sessionData.date_debut);
                    if (isNaN(startDate.getTime())) {
                        throw new Error("Format de date_debut invalide");
                    }
                } catch (e) {
                    throw new Error("Format de date_debut invalide");
                }
                
                try {
                    endDate = new Date(sessionData.date_fin);
                    if (isNaN(endDate.getTime())) {
                        throw new Error("Format de date_fin invalide");
                    }
                } catch (e) {
                    throw new Error("Format de date_fin invalide");
                }

                // Vérification que la date de fin est après la date de début
                if (endDate < startDate) {
                    throw new Error("La date de fin doit être postérieure à la date de début");
                }

                // Calcul de la durée si non fournie
                let duree = sessionData.duree;
                if (!duree || duree <= 0) {
                    const timeDiff = endDate.getTime() - startDate.getTime();
                    duree = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 pour inclure le jour de début
                }

                // Mise à jour de la session existante
                const [result] = await db.query(
                    `UPDATE session 
                    SET date_debut = ?, date_fin = ?, duree = ?
                    WHERE id_session = ?`,
                    [
                        sessionData.date_debut,
                        sessionData.date_fin,
                        duree,
                        sessionData.id_session
                    ]
                );

                // Vérification qu'une ligne a bien été mise à jour
                if (result.affectedRows === 0) {
                    throw new Error("Aucune session trouvée avec cet id_session");
                }

                successfulUpdates.push({
                    id_session: sessionData.id_session,
                    date_debut: sessionData.date_debut,
                    date_fin: sessionData.date_fin,
                    duree: duree,
                    updated: true
                });

            } catch (error) {
                errors.push({
                    item_index: index,
                    input_data: sessionData,
                    error: error.message,
                    error_code: error.code || "SESSION_UPDATE_ERROR"
                });
                console.error(`Erreur sur l'item ${index}:`, error);
            }
        }

        // Préparation de la réponse
        if (successfulUpdates.length === 0) {
            return res.status(422).json({
                success: false,
                message: "Aucune session n'a pu être mise à jour",
                total_items: req.body.length,
                updated_items: 0,
                failed_items: errors.length,
                errors: errors
            });
        }

        return res.status(200).json({
            success: true,
            message: `${successfulUpdates.length} session(s) mise(s) à jour avec ${errors.length} erreur(s)`,
            total_items: req.body.length,
            updated_items: successfulUpdates.length,
            failed_items: errors.length,
            data: successfulUpdates,
            ...(errors.length > 0 && { errors: errors })
        });

    } catch (globalError) {
        console.error('Erreur globale du contrôleur:', globalError);
        return res.status(500).json({
            success: false,
            message: "Erreur interne du serveur",
            error: globalError.message,
            error_code: "INTERNAL_SERVER_ERROR"
        });
    }
};







  module.exports = {
    createCalendrierformation,
    deleteCalendrierFormation,
    getcalformation,
    deleteSessionFromCalendrier,
    addSessionToCalendrier
   };