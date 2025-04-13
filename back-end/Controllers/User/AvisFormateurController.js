const db = require('../../connect');  

const getThemesByFormateur = (req, res) => {
  const { idFormateur } = req.query;

  if (!idFormateur) {
    return res.status(400).json({ message: "ID formateur requis" });
  }

  const sql = `
   SELECT s.id_session AS id, s.theme AS nom, s.lieu, s.type_session, s.etat, 
   COALESCE(fp.id_presence, fpp.id_presence) AS id_presence, 
   fp.entreprise_beneficiaire, 
   COUNT(DISTINCT fpp.id_participant) AS nb_participants 
   FROM session s 
   JOIN formateur f ON s.id_formateur = f.id_formateur 
   LEFT JOIN feuille_presence fp ON s.id_session = fp.id_calendrier 
   LEFT JOIN feuille_presence_participants fpp ON s.id_session = fpp.id_session 
   WHERE f.id_formateur = ? 
   GROUP BY s.id_session, fpp.id_presence 
   ORDER BY s.id_session DESC;
  `;

  db.query(sql, [idFormateur], (err, results) => {
    if (err) {
      console.error("Erreur MySQL :", err);
      return res.status(500).json({ message: "Erreur serveur", details: err.message });
    }
    res.json({ sessions: results });
  });
};

// Récupérer les informations de la feuille de présence
// Récupérer la feuille de présence par id_calendrier (themeId)
const getFeuillePresence = async (req, res) => {
  const { id_presence } = req.params;
  const sql = `
    SELECT 
        fp.id_presence, 
        fp.entreprise_beneficiaire, 
        DATE_FORMAT(c.date_debut, '%d/%m/%Y') AS date_debut, 
        DATE_FORMAT(c.date_fin, '%d/%m/%Y') AS date_fin,
        c.id AS id_calendrier,
        p.id_participant,
        p.nom_complet
    FROM feuille_presence fp
    JOIN calendrierFormation c ON fp.id_calendrier = c.id
    LEFT JOIN feuille_presence_participants fpp ON fp.id_presence = fpp.id_presence
    LEFT JOIN participant p ON fpp.id_participant = p.id_participant
    WHERE fp.id_presence = ?;
  `;

  db.query(sql, [id_presence], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Erreur lors de la récupération des données" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Aucune donnée trouvée pour cette présence" });
    }
    console.log("Requête reçue avec id_presence:", id_presence);

    // Organiser les résultats pour avoir un seul objet contenant une liste de participants
    const presenceInfo = {
      id_presence: results[0].id_presence,
      entreprise_beneficiaire: results[0].entreprise_beneficiaire,
      date_debut: results[0].date_debut,
      date_fin: results[0].date_fin,
      id_calendrier: results[0].id_calendrier,
      participants: results
        .filter(row => row.id_participant) // Exclure les NULL si pas de participants
        .map(row => ({
          id_participant: row.id_participant,
          nom_complet: row.nom_complet
        })),
    };

    res.json(presenceInfo);
  });
};
// Récupérer les participants par id_presence
const getParticipantsByPresence = async (req, res) => {
  const { id_presence } = req.query;

  if (!id_presence) {
    return res.status(400).json({ message: "ID de présence requis" });
  }

  const sql = `
    SELECT p.id_participant, p.nom_complet 
    FROM participant p
    JOIN feuille_presence_participants fpp ON p.id_participant = fpp.id_participant
    WHERE fpp.id_presence = ?
  `;

  db.query(sql, [id_presence], (err, results) => {
    if (err) {
      console.error("Erreur MySQL :", err);
      return res.status(500).json({ message: "Erreur serveur", details: err.message });
    }
    res.json(results);
  });
};
// Soumettre une évaluation pour un participant
const submitEvaluation = async (req, res) => {
  try {
    const { evaluations, id_presence, id_formateur, organisme_formation } = req.body;

    // Validation des données
    if (!id_presence || !id_formateur || !organisme_formation || !evaluations) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    // Insertion dans avis_formateur avec promesse
    const avisResult = await new Promise((resolve, reject) => {
      db.query(
        `INSERT INTO avis_formateur 
         (id_formateur, id_presence, organisme_formation) 
         VALUES (?, ?, ?)`,
        [id_formateur, id_presence, organisme_formation],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });

    const id_avis = avisResult.insertId;

    // Insertion des évaluations dans avis_formateur_details
    for (const [id_participant, evaluation] of Object.entries(evaluations)) {
      await new Promise((resolve, reject) => {
        db.query(
          `INSERT INTO avis_formateur_details 
           (id_avis, id_participant, 
            connaissances_professionnelles, connaissances_equipements,
            comprehension_competences, aptitude_appliquer_infos,
            rapidite_execution, qualite_travaux,
            clarte_pertinence_resultats, perfectionnement_connaissances,
            respect_consignes_constructeur, respect_normes_securite,
            autonomie_travail, participation,
            assiduite_ponctualite, initiative,
            esprit_groupe, observation)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id_avis, id_participant,
            evaluation.connaissances_professionnelles,
            evaluation.connaissances_equipements,
            evaluation.comprehension_competences,
            evaluation.aptitude_appliquer_infos,
            evaluation.rapidite_execution,
            evaluation.qualite_travaux,
            evaluation.clarte_pertinence_resultats,
            evaluation.perfectionnement_connaissances,
            evaluation.respect_consignes_constructeur,
            evaluation.respect_normes_securite,
            evaluation.autonomie_travail,
            evaluation.participation,
            evaluation.assiduite_ponctualite,
            evaluation.initiative,
            evaluation.esprit_groupe,
            evaluation.observation
          ],
          (err, result) => {
            if (err) return reject(err);
            resolve(result);
          }
        );
      });
    }

    res.json({ message: 'Évaluation enregistrée avec succès' });

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'évaluation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};



module.exports={getFeuillePresence,
  getParticipantsByPresence,
  getThemesByFormateur,
submitEvaluation
}

/*
const AvisFormateur = async(req, res) => {
    const {
      connaissances_professionnelles, connaissances_equipements,
      comprehension_competences, aptitude_appliquer_infos,
      rapidite_execution,qualite_travaux,
      clarte_pertinence_resultats, perfectionnement_connaissances,
      respect_consignes_constructeur,respect_normes_securite,
      autonomie_travail,participation,
      assiduite_ponctualite,initiative,
      esprit_groupe,observation,
    } = req.body;
  
    // Convertir les valeurs textuelles en entiers (1 à 5)
    const mapEvaluationToInt = (value) => {
      switch (value) {
        case 'insuffisant':
          return 1;
        case 'passable':
          return 2;
        case 'assez bien':
          return 3;
        case 'bien':
          return 4;
        case 'tres bien':
          return 5;
        default:
          return null; // Gestion des valeurs invalides
      }
    };
  
    // Requête SQL pour insérer les données
    const query = `
      INSERT INTO avis_formateur (
        connaissances_professionnelles,
        connaissances_equipements,
        comprehension_competences,
        aptitude_appliquer_infos,
        rapidite_execution,
        qualite_travaux,
        clarte_pertinence_resultats,
        perfectionnement_connaissances,
        respect_consignes_constructeur,
        respect_normes_securite,
        autonomie_travail,
        participation,
        assiduite_ponctualite,
        initiative,
        esprit_groupe,
        observation
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  
    const values = [
      mapEvaluationToInt(connaissances_professionnelles),
      mapEvaluationToInt(connaissances_equipements),
      mapEvaluationToInt(comprehension_competences),
      mapEvaluationToInt(aptitude_appliquer_infos),
      mapEvaluationToInt(rapidite_execution),
      mapEvaluationToInt(qualite_travaux),
      mapEvaluationToInt(clarte_pertinence_resultats),
      mapEvaluationToInt(perfectionnement_connaissances),
      mapEvaluationToInt(respect_consignes_constructeur),
      mapEvaluationToInt(respect_normes_securite),
      mapEvaluationToInt(autonomie_travail),
      mapEvaluationToInt(participation),
      mapEvaluationToInt(assiduite_ponctualite),
      mapEvaluationToInt(initiative),
      mapEvaluationToInt(esprit_groupe),
      observation,
    ];
  
    // Exécuter la requête
    db.query(query, values, (err, results) => {
      if (err) {
        console.error('Erreur lors de l\'insertion des données:', err);
        res.status(500).json({ error: 'Erreur lors de l\'insertion des données' });
        return;
      }
      res.status(201).json({ message: 'Évaluation insérée avec succès', id: results.insertId });
    });}

    module.exports = { AvisFormateur};*/