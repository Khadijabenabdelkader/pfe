


const db = require('../../connect');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const getFormation = async (req, res) => {
  const query = `
  SELECT f.domaine,
   f.id_formation,
   s.id_session,
   s.theme,
   s.code,
   s.nb_participants, 
   s.lieu, 
   s.etat, 
   s.type_session, 
   s.id_formateur,
   fm.nom_complet AS formateur 
   FROM formation f 
   LEFT JOIN session s 
   ON f.id_formation = s.id_formation 
   LEFT JOIN formateur fm 
   ON s.id_formateur = fm.id_formateur 
   ORDER BY f.domaine, f.id_formation ;`
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching formations:", err);
      return res.status(500).json({ error: err.message });
    }
    
    // Structurer les résultats en regroupant les sessions sous leur formation
    const formationsMap = new Map();
    results.forEach((row) => {
      if (!formationsMap.has(row.id_formation)) {
        formationsMap.set(row.id_formation, {
          domaine: row.domaine,
          id_formation: row.id_formation,
          sessions: [],
        });
      }
      if (row.id_session) {
        formationsMap.get(row.id_formation).sessions.push({
          id_session: row.id_session,
          theme: row.theme,
          code: row.code,
          nb_participants:row.nb_participants, 
          etat: row.etat,
          type_session: row.type_session,
          lieu:row.lieu,
          id_formateur: row.id_formateur
        });
      }
    });
    return res.json(Array.from(formationsMap.values()));
  });
};












{/*
const getCatalogue = async (req, res) => {
  const query = `
  SELECT f.domaine, f.id_formation,
  s.id_session, s.code, s.theme, 
  fiche_prg.chemin as fiche_prg , 
  cours_session.chemin as cours , 
  fm.nom_complet , 
  fm.id_formateur, fm.mail, fm.adr, 
  fm.domaine_de_competences , 
  fm.themes_a_enseigner, 
  fm.tarif_journalier, 
  fm.nb_formations, fm.tel, fm.cv, 
  fm.niveau_etude, fm.nb_experience, 
  fm.horraire_jour, fm.nom_banque, 
  fm.RIB, fm.domaine_assistance, 
  fm.retour_sacConsulting 
  FROM formation f LEFT JOIN session s 
  ON f.id_formation = s.id_formation 
  LEFT Join fiche_prg ON s.id_session = fiche_prg.id_session 
  LEFT Join cours_session ON s.id_session = cours_session.id_session 
  LEFT JOIN formateur fm 
  ON FIND_IN_SET(s.theme, fm.themes_a_enseigner) > 0 
  ORDER BY s.id_session;`
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching catalogue:", err);
      return res.status(500).json({ error: err.message });
    }

    const formationsMap = new Map();

    results.forEach(row => {
      if (!formationsMap.has(row.id_formation)) {
        formationsMap.set(row.id_formation, {
          id_formation: row.id_formation,
          domaine: row.domaine,
          sessions: []
        });
      }

      const formation = formationsMap.get(row.id_formation);
      let session = formation.sessions.find(s => s.id_session === row.id_session);

      if (row.id_session && !session) {
        session = {
          id_session: row.id_session,
          theme: row.theme,
          code: row.code,
          fiche_prg: row.fiche_prg,
          cours: row.cours,
          etat: row.etat,
          formateurs: []
        };
        formation.sessions.push(session);
      }

      if (row.id_formateur && session) {
        const formateurExists = session.formateurs.some(f => f.id_formateur === row.id_formateur);
        if (!formateurExists) {
        session.formateurs.push({
          id_formateur: row.id_formateur,
          nom_complet: row.nom_complet,
          mail: row.mail,
          adr: row.adr,
          domaine_de_competences: row.domaine_de_competences,
          themes_a_enseigner: row.themes_a_enseigner,
          tarif_journalier: row.tarif_journalier,
          nb_formations: row.nb_formations,
          tel: row.tel,
          cv: row.cv,
          niveau_etude: row.niveau_etude,
          nb_experience: row.nb_experience,
          horraire_jour: row.horraire_jour,
          nom_banque: row.nom_banque,
          RIB: row.RIB,
          domaine_assistance: row.domaine_assistance,
          retour_sacConsulting: row.retour_sacConsulting
        });
      }}
    });

    res.json(Array.from(formationsMap.values()));
  });
};
    
*/}



















      


//3. Ajouter une formation et ses session avec un formateur
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // Increase limit to 50 MB
});

  
const addFormation = async (req, res) => {
  const { domaine } = req.body;
  const sessions = JSON.parse(req.body.sessions);
  console.log("req.body.sessions :", req.body.sessions);
  console.log("Données reçues (req.body) :", req.body);
  console.log("Fichiers reçus (req.files) :", req.files);
  if (!sessions || !Array.isArray(sessions)) {
    return res.status(400).json({ message: 'Les sessions doivent être un tableau.' });
  }

  // Récupérer les fichiers fiche_programme
  const fichePrgFiles = req.files ? req.files : []; // Assurez-vous que fichePrgFiles est un tableau

  if (fichePrgFiles.length === 0) {
    return res.status(400).json({ message: 'Aucun fichier fiche_programme n\'a été téléchargé.' });
  }

  try {
    // 1. Insérer la formation dans la table `formation`
    const queryFormation = 'INSERT INTO formation (domaine) VALUES (?)';
    const formationResult = await new Promise((resolve, reject) => {
      db.query(queryFormation, [domaine], (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });

    const id_formation = formationResult.insertId;

    // 2. Insérer les fichiers fiche_programme dans la table `fiche_prg`
    const queryFichePrg = 'INSERT INTO fiche_prg (chemin) VALUES (?)';
    const fichePrgPromises = fichePrgFiles.map((file) => {
      return new Promise((resolve, reject) => {
        const filePath = path.join('uploads', file.filename);
        db.query(queryFichePrg, [filePath], (err, result) => {
          if (err) {
            return reject(err);
          }
          resolve(result.insertId);
        });
      });
    });

    const fichePrgIds = await Promise.all(fichePrgPromises);

    // 3. Insérer les sessions dans la table `session` avec l'id_fiche_prg
    const querySessions = 'INSERT INTO session (theme, code, nb_participants, etat, type_session, lieu, id_formation, id_formateur, id_fiche_prg) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const sessionPromises = sessions.map((session, index) => {
      const { theme, code, nb_participants, etat, type_session, lieu, id_formateur } = session;
      const id_fichePrg = fichePrgIds[index]; // Associer chaque session à son fichier fiche_programme

      return new Promise((resolve, reject) => {
        db.query(
          querySessions,
          [theme, code, nb_participants, etat, type_session, lieu, id_formation, id_formateur, id_fichePrg],
          (err, sessionResult) => {
            if (err) {
              return reject({ message: 'Erreur lors de la création des sessions', error: err });
            }
            resolve(sessionResult.insertId);
          }
        );
      });
    });

    await Promise.all(sessionPromises);

    return res.status(201).json({
      message: 'Formation, sessions et relations formateurs créées avec succès',
      id_formation,
      fichePrgIds,
      sessions,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la formation:", error);
    return res.status(500).json({ error: error.message });
  }
};




const updateFormation =async (req, res) => {
  const { id_formation } = req.params;
  const { domaine, sessions } = req.body;  
  try {
  const updateFormationQuery = `
    UPDATE formation
    SET domaine = ?
    WHERE id_formation = ? `;
  db.query(updateFormationQuery, [domaine,id_formation], (err, result) => {
    if (err) {
      console.error('Erreur lors de la mise à jour de la formation:', err);
      return res.status(500).json({ message: 'Erreur lors de la mise à jour de la formation' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Formation non trouvée' });
    }
    // Mise à jour des sessions associées à la formation
    sessions.forEach(session => {
      const { id_session, theme, etat,nb_participants, type_session,lieu, id_formateur } = session;
      const updateSessionQuery = `
        UPDATE session
        SET theme = ?,  etat = ?,nb_participants=?, type_session = ?,lieu=?, id_formateur =?
        WHERE id_session = ?
      `;
      db.query(updateSessionQuery, [theme, etat,nb_participants, type_session,lieu,id_formateur, id_session], (err, result) => {
        if (err) {
          console.error('Erreur lors de la mise à jour de la session:', err);
          return res.status(500).json({ message: 'Erreur lors de la mise à jour de la session' });
        }
      });
    });
    res.json({ message: 'Formation et sessions mises à jour avec succès' });
  });
} catch (error) {
  console.error('Erreur lors de la mise à jour de la formation:', error);
  res.status(500).json({ message: 'Erreur lors de la mise à jour de la formation' });
}
};


// ✅ 5. Supprimer une formation et ses sessions
const deleteFormation = (req, res) => {
  const { id_formation } = req.params;

  if (!id_formation || isNaN(id_formation)) {
    return res.status(400).json({ message: "ID de formation invalide." });
  }
  const deleteFormationQuery = `DELETE FROM formation WHERE id_formation = ?;`

    // Ensuite, supprime la formation
    db.query(deleteFormationQuery, [id_formation], (err, result) => {
      if (err) {
        console.error("Erreur lors de la suppression de la formation :", err);
        return res.status(500).json({ message: "Erreur lors de la suppression de la formation", error: err });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Aucune formation trouvée avec cet ID" });
      }
      res.json({ message: "Formation supprimée avec succès" });
  });
};



//function update
const updateSession = (req, res) => {
  const { id_formation, id_session } = req.params;
  const { code, theme,  formateur } = req.body;
  
  // Vérifier si la session et la formation existent
  const checkSessionQuery = `
    SELECT * FROM session WHERE id_session = ? AND id_formation = ?`;

  db.query(checkSessionQuery, [id_session, id_formation], (err, sessionResults) => {
    if (err) {
      return res.status(500).json({ error: "Erreur lors de la vérification de la session" });
    }
    if (sessionResults.length === 0) {
      return res.status(404).json({ error: "Session non trouvée" });}
    // Vérifier si le formateur existe
    const checkFormateurQuery = `
      SELECT * FROM formateur WHERE id_formateur = ?
    `;
    db.query(checkFormateurQuery, [formateur], (err, formateurResults) => {
      if (err) {
        return res.status(500).json({ error: "Erreur lors de la vérification du formateur" });
      }

      if (formateurResults.length === 0) {
        return res.status(404).json({ error: "Formateur non trouvé" });
      }

      // Mettre à jour la session
      const updateSessionQuery = `
        UPDATE session
        SET code = ?, theme = ?, date_debut = ?, date_fin = ?, duree = ?,id_formateur=?
        WHERE id_session = ? AND id_formation = ?`;
      db.query(updateSessionQuery, [code, theme,formateur, id_session, id_formation], (err, result) => {
        if (err) {
          return res.status(500).json({ error: "Erreur lors de la mise à jour de la session" });
        }
        
      });
    });
  });
};


// ✅ 6. Supprimer une session
const deleteSession = (req, res) => {
  const { id_formation, id_session } = req.params;

    // Supprimer la session dans la table session
    const deleteSessionQuery = `
      DELETE FROM session WHERE id_session = ? AND id_formation = ?`;
    db.query(deleteSessionQuery, [id_session, id_formation], (err, result) => {
      if (err) {
        console.error("Erreur lors de la suppression de la session:", err);
        return res.status(500).json({ message: "Erreur serveur lors de la suppression de la session" }); }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Session non trouvée' });  }
      res.json({ message: "Session supprimée avec succès" });
  });
};



const addSession = async (req, res) => {
  const { id } = req.params;
  const { theme, code,  nb_participants, etat, type_session, formateurs } = req.body;

  if (!theme || !code ) {
    return res.status(400).json({ error: "Tous les champs obligatoires doivent être remplis" });
  }

  // Ajout de la session dans la base de données
  const query = `
    INSERT INTO session (theme, code,  nb_participants,  etat, type_session, id_formation)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [theme, code, nb_participants || null, etat || 'A Réaliser', type_session || null, id];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Erreur lors de l'ajout de la session:", err);
      return res.status(500).json({ error: "Erreur lors de l'ajout de la session" });
    }
    const sessionId = result.insertId;

    // Ajout des formateurs si fournis
    if (formateurs && formateurs.length > 0) {
      const formateurQueries = formateurs.map((id_formateur) => {
        return new Promise((resolve, reject) => {
          db.query(
            `INSERT INTO formateur_session (id_session, id_formateur) VALUES (?, ?)`,
            [sessionId, id_formateur],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      });

      Promise.all(formateurQueries)
        .then(() => {
          db.query(`SELECT * FROM session WHERE id_formation = ?`, [id], (err, sessions) => {
            if (err) return res.status(500).json({ error: "Erreur lors de la récupération des sessions" });
            return res.status(201).json({ sessions: sessions || [] });
          });
        })
        .catch((err) => {
          console.error("Erreur lors de l'association des formateurs:", err);
          return res.status(500).json({ error: "Erreur lors de l'association des formateurs à la session" });
        });
    } else {
      db.query(`SELECT * FROM session WHERE id_formation = ?`, [id], (err, sessions) => {
        if (err) return res.status(500).json({ error: "Erreur lors de la récupération des sessions" });
        return res.status(201).json({ sessions: sessions.length ? sessions : [] });
      });
    }
  });
};
module.exports = {
  getFormation,
  addFormation,
  updateFormation,
  deleteFormation,
  deleteSession,
  updateSession,
  addSession,
  upload
};
