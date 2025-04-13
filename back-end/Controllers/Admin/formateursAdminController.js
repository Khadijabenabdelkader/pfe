const db = require('../../connect');
const path = require('path');
const fs = require('fs');  // Assure-toi d'avoir ce module
const bcrypt = require('bcrypt');
const pdf2json = require("pdf2json");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const pdfParse =require('pdf-parse');

const getFormateurs = (req, res) => {
  const query = 'SELECT * FROM formateur';
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching formateurs:", err);  // Log l'erreur pour aider au débogage
      return res.status(500).json({ error: err.message });
    }

    // Pour chaque formateur, ajouter les informations des fiches programme et des sessions de cours
    const formateursWithFichesAndCours = [];
    let processedFormateurs = 0;

    results.forEach(formateur => {
      const fichePrgQuery = 'SELECT * FROM fiche_prg WHERE id_formateur = ?';
      const coursSessionQuery = 'SELECT * FROM cours_session WHERE id_formateur = ?';  // Nouvelle requête pour les cours de session
      db.query(fichePrgQuery, [formateur.id_formateur], (err, ficheResults) => {
        if (err) {
          console.error("Error fetching fiches programme:", err);
          return res.status(500).json({ error: err.message });
        }

        // Requête pour obtenir les sessions de cours liées à ce formateur
        db.query(coursSessionQuery, [formateur.id_formateur], (err, coursResults) => {
          if (err) {
            console.error("Error fetching cours sessions:", err);
            return res.status(500).json({ error: err.message });
          }

          // Ajout des fiches programme et des sessions de cours au formateur
          formateur.fichePrg = ficheResults;
          formateur.coursSession = coursResults; // Ajout des cours sessions
          formateursWithFichesAndCours.push(formateur);
          processedFormateurs++;

          // Si tous les formateurs ont été traités, renvoyer la réponse
          if (processedFormateurs === results.length) {
            return res.json(formateursWithFichesAndCours);
          }
        });
      });
    });
  });
};

const getFormateurById = (req, res) => {
  const formateurId = req.params.id;

  const query = 'SELECT * FROM formateur WHERE id_formateur = ?';
  db.query(query, [formateurId], (err, result) => {
    if (err) {
      console.error("Error fetching formateur:", err);  // Log l'erreur pour aider au débogage
      return res.status(500).json({ error: err.message });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Formateur not found' });
    }

    const formateur = result[0];
    console.log(formateur.cv); // Voir si 'cv' est bien un objet et contient un chemin

    // Requête pour obtenir les fiches programme et les sessions de cours liées à ce formateur
    const fichePrgQuery = 'SELECT * FROM fiche_prg WHERE id_formateur = ?';
    const coursSessionQuery = 'SELECT * FROM cours_session WHERE id_formateur = ?'; // Nouvelle requête pour les cours de session

    // Récupération des fiches programme
    db.query(fichePrgQuery, [formateurId], (err, ficheResults) => {
      if (err) {
        console.error("Error fetching fiches programme:", err);
        return res.status(500).json({ error: err.message });
      }

      // Récupération des sessions de cours
      db.query(coursSessionQuery, [formateurId], (err, coursResults) => {
        if (err) {
          console.error("Error fetching cours sessions:", err);
          return res.status(500).json({ error: err.message });
        }

        // Ajouter les fiches programme et les sessions de cours au formateur
        formateur.fichePrg = ficheResults;
        formateur.coursSession = coursResults; // Ajouter les sessions de cours

        return res.json(formateur);
      });
    });
  });
};
const updateFormateur = (req, res) => {
  const id = req.params.id;
  let coursSession = [];
  let fichePrg = [];
  let cv = null;

  // Lire les fichiers si disponibles
  if (req.files?.coursSession) {
    coursSession = req.files.coursSession.map(file => file.filename);
  }
  if (req.files?.fichePrg) {
    fichePrg = req.files.fichePrg.map(file => file.filename);
  }

  // Si un CV est téléchargé, le mettre à jour, sinon garder l'ancien
  if (req.files?.cv) {
    cv = req.files.cv[0].filename;
  }

  const { nom_complet, mail, adr, domaine_de_competences, themes_a_enseigner, 
    tarif_journalier, nb_formations, tel, mdp_formateur, niveau_etude, 
    nb_experience, horraire_jour, nom_banque, RIB, domaine_assistance, retour_sacConsulting, deleteFiches 
  } = req.body;

  // Récupérer l'ancien CV si nécessaire
  const getCurrentCvQuery = 'SELECT cv FROM formateur WHERE id_formateur = ?';
  db.query(getCurrentCvQuery, [id], (err, result) => {
    if (err) {
      console.error('Erreur lors de la récupération de l\'ancien CV:', err);
      return res.status(500).json({ error: err.message });
    }

    // Si aucun CV n'est téléchargé, garder l'ancien CV
    if (!cv && result.length > 0) {
      cv = result[0].cv;
    }
    const domaineCompetencesString = domaine_de_competences 
  ? (typeof domaine_de_competences === 'string' ? domaine_de_competences : JSON.stringify(domaine_de_competences))
  : '[]';

const themesAEnseignerString = themes_a_enseigner 
  ? (typeof themes_a_enseigner === 'string' ? themes_a_enseigner : JSON.stringify(themes_a_enseigner))
  : '[]';

      const updates = {
      nom_complet, mail, adr,  domaine_de_competences: domaineCompetencesString, 
      themes_a_enseigner: themesAEnseignerString, 
      tarif_journalier, nb_formations, tel, cv, mdp_formateur, niveau_etude, 
      nb_experience, horraire_jour, nom_banque, RIB, domaine_assistance, retour_sacConsulting
    };
    /*const updates = {
      nom_complet,
      mail,
      adr,
      domaine_de_competences: domaine_de_competences 
        ? (Array.isArray(domaine_de_competences) ? domaine_de_competences.join(', ') : domaine_de_competences)
        : null,
      themes_a_enseigner: themes_a_enseigner 
        ? (Array.isArray(themes_a_enseigner) ? themes_a_enseigner.join(', ') : themes_a_enseigner)
        : null,
      tarif_journalier,
      nb_formations,
      tel,
      cv,
      mdp_formateur,
      niveau_etude,
      nb_experience,
      horraire_jour,
      nom_banque,
      RIB,
      domaine_assistance,
      retour_sacConsulting
    };*/
    // Construction dynamique de la requête UPDATE
    const fields = Object.keys(updates)
      .filter(key => updates[key] !== undefined)
      .map(key => `${key} = ?`)
      .join(', ');

    const values = Object.values(updates).filter(value => value !== undefined).concat(id);

    if (!fields) {
      return res.status(400).json({ error: 'Aucun champ valide à mettre à jour' });
    }

    const query =' UPDATE formateur SET ${fields} WHERE id_formateur = ?;'

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Erreur lors de la mise à jour du formateur:', err);
        return res.status(500).json({ error: err.message });
      }

      // Mettre à jour les fiches programme si nécessaire
      if (deleteFiches === "true" && fichePrg.length > 0) {
        updateFichesProgramme(id, fichePrg);
      }

      // Mettre à jour les cours session si nécessaire
      if (deleteFiches === "true" && coursSession.length > 0) {
        updateCoursSession(id, coursSession);
      }

      return res.json({ message: 'Formateur mis à jour avec succès' });
    });
  });
};

// Fonction pour mettre à jour les fiches programme
const updateFichesProgramme = (id, fichePrg) => {
  const deleteFicheQuery = 'DELETE FROM fiche_prg WHERE id_formateur = ?';

  db.query(deleteFicheQuery, [id], (err) => {
    if (err) {
      console.error("Erreur lors de la suppression des anciennes fiches programmes:", err);
      return;
    }

    const insertFichePrgQuery = 'INSERT INTO fiche_prg (id_formateur, chemin) VALUES (?, ?)';
    fichePrg.forEach(file => {
      db.query(insertFichePrgQuery, [id, file], (err) => {
        if (err) {
          console.error("Erreur lors de l'insertion des nouvelles fiches programmes:", err);
        }
      });
    });
  });
};

// Fonction pour mettre à jour les cours session
const updateCoursSession = (id, coursSession) => {
  const deleteCoursQuery = 'DELETE FROM cours_session WHERE id_formateur = ?';

  db.query(deleteCoursQuery, [id], (err) => {
    if (err) {
      console.error("Erreur lors de la suppression des anciens cours session:", err);
      return;
    }

    const insertCoursSessionQuery = 'INSERT INTO cours_session (id_formateur, chemin) VALUES (?, ?)';
    coursSession.forEach(file => {
      db.query(insertCoursSessionQuery, [id, file], (err) => {
        if (err) {
          console.error("Erreur lors de l'insertion des nouveaux cours session:", err);
        }
      });
    });
  });
};

const deleteFormateur = (req, res) => {
  const formateurId = req.params.id; // Récupère l'ID du formateur

  // Requête pour récupérer les fichiers du formateur
  const getFormateurQuery = 'SELECT cv FROM formateur WHERE id_formateur = ?';

  db.query(getFormateurQuery, [formateurId], (err, formateurResults) => {
    if (err) {
      return res.status(500).json({ error: "Erreur lors de la récupération des fichiers du formateur: " + err.message });
    }

    if (formateurResults.length === 0) {
      return res.status(404).json({ message: "Formateur non trouvé" });
    }

    const formateur = formateurResults[0];

    // Supprimer les fichiers associés (CV, fiches programme, cours session)
    if (formateur.cv) {
      const cvPath = path.join(__dirname, '../..', 'uploads', formateur.cv);
      fs.unlink(cvPath, (err) => {
        if (err) console.error("Erreur de suppression du CV:", err);
      });
    }

    // Supprimer les fiches programme associées
    const deleteFichePrgQuery = 'DELETE FROM fiche_prg WHERE id_formateur = ?';
    db.query(deleteFichePrgQuery, [formateurId], (err) => {
      if (err) {
        return res.status(500).json({ error: "Erreur lors de la suppression des fiches programme: " + err.message });
      }

      // Supprimer les cours session associés
      const deleteCoursSessionQuery = 'DELETE FROM cours_session WHERE id_formateur = ?';
      db.query(deleteCoursSessionQuery, [formateurId], (err) => {
        if (err) {
          return res.status(500).json({ error: "Erreur lors de la suppression des cours session: " + err.message });
        }

        // Supprimer le formateur
        const deleteFormateurQuery = 'DELETE FROM formateur WHERE id_formateur = ?';
        db.query(deleteFormateurQuery, [formateurId], (err, results) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Formateur non trouvé' });
          }

          return res.json({ message: 'Formateur et fichiers associés supprimés avec succès' });
        });
      });
    });
  });
};

const addFormateur = (req, res) => {
  const { nom_complet, mail, adr, domaine_de_competences, themes_a_enseigner, 
    tarif_journalier, nb_formations, tel, cv, mdp_formateur, niveau_etude, 
    nb_experience, horraire_jour, nom_banque, RIB, domaine_assistance, retour_sacConsulting 
  } = req.body;

  if (!nom_complet || !mail || !mdp_formateur) {
    return res.status(400).json({ error: "Les champs 'nom_complet', 'mail' et 'mdp_formateur' sont obligatoires." });
  }
const domaineCompetencesString = domaine_de_competences.join(', ');
const themesAEnseignerString = themes_a_enseigner.join(', ');
  // Hashing du mot de passe
  bcrypt.hash(mdp_formateur, 10, (err, hashedPassword) => {
    if (err) {
      console.error("Erreur de hachage du mot de passe:", err);
      return res.status(500).json({ error: "Erreur de sécurité lors de la création du mot de passe." });
    }

    // Gestion des fichiers
    const fichePrgPath = req.files?.fichePrg ? req.files.fichePrg[0].filename : undefined;
    const cvPath = req.files?.cv ? req.files.cv[0].filename : undefined;
    const coursPath = req.files?.coursSession? req.files.coursSession[0].filename : undefined;
    // Requête SQL pour insérer un formateur
    const queryFormateur = `INSERT INTO formateur (nom_complet, mail, adr, domaine_de_competences, 
    themes_a_enseigner, tarif_journalier, nb_formations, tel, cv, mdp_formateur, niveau_etude, 
    nb_experience, horraire_jour, nom_banque, RIB, domaine_assistance, retour_sacConsulting) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      queryFormateur,
      [nom_complet, mail, adr, domaineCompetencesString, themesAEnseignerString, tarif_journalier,
        nb_formations, tel, cvPath, hashedPassword, niveau_etude, nb_experience, horraire_jour, nom_banque,
        RIB, domaine_assistance, retour_sacConsulting],
      (err, result) => {
        if (err) {
          console.error("Erreur SQL:", err);
          return res.status(500).json({ error: err.message });
        }

        const formateurId = result.insertId;
        let insertions = [];

        // Insertion fiche programme si présent
        if (fichePrgPath) {
          insertions.push(new Promise((resolve, reject) => {
            const queryFichePrg = 'INSERT INTO fiche_prg (chemin, id_formateur) VALUES (?, ?);'
            db.query(queryFichePrg, [fichePrgPath, formateurId], (err) => {
              if (err) reject("Erreur lors de l'ajout de la fiche programme.");
              else resolve();
            });
          }));
        }

        // Insertion cours session si présent
        if (coursPath) {
          insertions.push(new Promise((resolve, reject) => {
            const queryCours = 'INSERT INTO cours_session (chemin, id_formateur) VALUES (?, ?);'
            db.query(queryCours, [coursPath, formateurId], (err) => {
              if (err) reject("Erreur lors de l'ajout du cours de session.");
              else resolve();
            });
          }));
        }

        // Attendre toutes les insertions avant de renvoyer la réponse
        Promise.all(insertions)
          .then(() => res.status(201).json({ message: "Formateur et fichiers ajoutés avec succès", id: formateurId }))
          .catch(errorMsg => res.status(500).json({ error: errorMsg }));
      }
    );
  });
};
const extractPDF = async (req, res) => { 
  const { formateurId, searchTerm } = req.body;

  if (!formateurId || !searchTerm) {
    return res.status(400).json({ message: "ID du formateur et terme de recherche requis" });
  }

  try {
    // Récupérer les chemins des fichiers PDF du formateur
    const [results] = await db
      .promise()
      .query(
        "SELECT f.cv, fp.chemin FROM formateur f JOIN fiche_prg fp ON f.id_formateur = fp.id_formateur WHERE f.id_formateur = ?",
        [formateurId]
      );

    if (results.length === 0) {
      return res.status(404).json({ message: "Aucun fichier PDF trouvé pour ce formateur" });
    }

    // Liste des fichiers PDF (en utilisant uniquement le champ "chemin" de fiche_prg)
    const fichePrgPaths = results.map((record) =>
      path.join(__dirname, "..", "uploads", record.chemin)
    );

    // Log des chemins des fichiers PDF
    console.log("Chemins des fichiers PDF:", fichePrgPaths);

    // Utiliser Promise.all pour extraire le texte de chaque PDF
    const textPromises = fichePrgPaths.map(async (filePath) => {
      try {
        console.log('Lecture du fichier PDF : ${filePath}');
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        
        // Log du texte extrait
        console.log('Texte extrait de ${filePath}:', pdfData.text);

        return pdfData.text;
      } catch (err) {
        console.error('Erreur lors de la lecture ou de l\'extraction du PDF: ${filePath}', err);
        throw new Error('Erreur lors du traitement du fichier PDF: ${filePath}');
      }
    });

    const texts = await Promise.all(textPromises);
    const combinedText = texts.join(" ");

    // Log du texte combiné extrait
    console.log("Texte combiné extrait de tous les fichiers PDF:", combinedText);

    // Normaliser le texte et le terme de recherche pour une comparaison insensible à la casse
    const normalizedText = combinedText.toLowerCase();
    const normalizedSearchTerm = searchTerm.toLowerCase();

    // Vérifier si le terme de recherche est présent dans le texte combiné
    const contentMatch = normalizedText.includes(normalizedSearchTerm);

    if (contentMatch) {
      return res.json({ message: "Mot-clé trouvé dans le PDF", content: combinedText });
    } else {
      return res.json({ message: "Mot-clé non trouvé dans le PDF" });
    }
  } catch (error) {
    console.error("Erreur lors de l'extraction du contenu PDF:", error);
    return res.status(500).json({ message: "Erreur serveur lors de l'extraction du contenu PDF" });
  }
};
const getDomaineThemes = async (req, res) => {
  const query = `
    SELECT f.domaine, s.theme 
    FROM formation f 
    JOIN session s ON f.id_formation = s.id_formation
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Erreur lors de la récupération des domaines et thèmes');
    }
  
  
    const domainesThemes = results.reduce((acc, item) => {
      if (!acc[item.domaine]) {
        acc[item.domaine] = [];
      }
      acc[item.domaine].push(item.theme);
      return acc;
    }, {});
    
    res.json(domainesThemes);
  });
  
};

module.exports = {
    getFormateurs,
  getFormateurById,
  addFormateur,
  updateFormateur,
  deleteFormateur,
  extractPDF,
  getDomaineThemes
};