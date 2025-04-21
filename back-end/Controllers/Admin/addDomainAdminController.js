const db = require('../../connect');
{/*}
const addDomain = async (req, res) => {
  const { domaineName, abbreviation, themes } = req.body;
  
  // Démarrer une transaction
  db.beginTransaction(async (err) => {
    if (err) {
      return res.status(500).json({ error: "Erreur de transaction" });
    }

    try {
      // 1. Insérer le domaine dans la table `formation`
      const queryFormation = 'INSERT INTO formation (domaine) VALUES (?)';
      const formationResult = await new Promise((resolve, reject) => {
        db.query(queryFormation, [domaineName], (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });
      const id_formation = formationResult.insertId;

      // 2. Insérer les thèmes dans la table `session` et gérer les formateurs
      const sessionPromises = themes.map(async (theme) => {
        const { name, code, formateurs } = theme;

        // Insérer le thème dans la table session
        const querySession = 'INSERT INTO session (theme, code, id_formation) VALUES (?, ?, ?)';
        const sessionResult = await new Promise((resolve, reject) => {
          db.query(querySession, [name, code, id_formation], (err, result) => {
            if (err) return reject(err);
            resolve(result);
          });
        });
        const id_session = sessionResult.insertId;

        // Mettre à jour chaque formateur avec le thème et le rang
        const formateurPromises = formateurs.map((formateur) => {
          // Construire l'objet JSON pour themes_a_enseigner
          const themeEnseignement = {
            [name]: formateur.rang  // Format: { "code_theme": rang }
          };

          // 1. Vérifier si le formateur a déjà des thèmes enregistrés
          return new Promise((resolve, reject) => {
            db.query(
              'SELECT themes_a_enseigner FROM formateur WHERE id_formateur = ?',
              [formateur.id_formateur],
              (err, results) => {
                if (err) return reject(err);

                let existingThemes = {};
                if (results[0]?.themes_a_enseigner) {
                  try {
                    existingThemes = JSON.parse(results[0].themes_a_enseigner);
                  } catch (e) {
                    console.error("Erreur parsing JSON:", e);
                  }
                }

                // Fusionner avec le nouveau thème
                const updatedThemes = {
                  ...existingThemes,
                  ...themeEnseignement
                };

                // 2. Mettre à jour le formateur
                db.query(
                  `UPDATE formateur 
                   SET domaine_de_competences = ?,
                       themes_a_enseigner = ?
                   WHERE id_formateur = ?`,
                  [
                    domaineName, // domaine_de_competences
                    JSON.stringify(updatedThemes), // themes_a_enseigner
                    formateur.id_formateur
                  ],
                  (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                  }
                );
              }
            );
          });
        });

        await Promise.all(formateurPromises);
        return id_session;
      });

      await Promise.all(sessionPromises);

      // Valider la transaction
      db.commit((err) => {
        if (err) {
          return db.rollback(() => {
            throw err;
          });
        }

        return res.status(201).json({
          message: 'Domaine, thèmes et formateurs créés avec succès',
          id_formation,
          themes,
        });
      });
    } catch (error) {
      // Annuler la transaction en cas d'erreur
      db.rollback(() => {
        console.error("Erreur lors de l'ajout du domaine:", error);
        return res.status(500).json({ 
          error: error.message,
          details: error.stack 
        });
      });
    }
  });
};*/}





const addDomain = async (req, res) => {
  const { domaineName, abbreviation, themes } = req.body;
  
  // Démarrer une transaction
  db.beginTransaction(async (err) => {
    if (err) {
      return res.status(500).json({ error: "Erreur de transaction" });
    }

    try {
      // 2. Insérer les thèmes dans la table `session` et gérer les formateurs
      const sessionPromises = themes.map(async (theme) => {
        const { name, code, formateurs } = theme;

        // 1. Insérer le domaine dans la table `formation` pour CHAQUE thème
        const queryFormation = 'INSERT INTO formation (domaine) VALUES (?)';
        const formationResult = await new Promise((resolve, reject) => {
          db.query(queryFormation, [domaineName], (err, result) => {
            if (err) return reject(err);
            resolve(result);
          });
        });
        const id_formation = formationResult.insertId;

        // Insérer le thème dans la table session
        const querySession = 'INSERT INTO session (theme, code, id_formation) VALUES (?, ?, ?)';
        const sessionResult = await new Promise((resolve, reject) => {
          db.query(querySession, [name, code, id_formation], (err, result) => {
            if (err) return reject(err);
            resolve(result);
          });
        });
        const id_session = sessionResult.insertId;

        // Mettre à jour chaque formateur avec le thème et le rang
        const formateurPromises = formateurs.map((formateur) => {
          const themeEnseignement = {
            [name]: formateur.rang
          };

          return new Promise((resolve, reject) => {
            db.query(
              'SELECT themes_a_enseigner FROM formateur WHERE id_formateur = ?',
              [formateur.id_formateur],
              (err, results) => {
                if (err) return reject(err);

                let existingThemes = {};
                if (results[0]?.themes_a_enseigner) {
                  try {
                    existingThemes = JSON.parse(results[0].themes_a_enseigner);
                  } catch (e) {
                    console.error("Erreur parsing JSON:", e);
                  }
                }

                const updatedThemes = {
                  ...existingThemes,
                  ...themeEnseignement
                };

                db.query(
                  `UPDATE formateur 
                   SET domaine_de_competences = ?,
                       themes_a_enseigner = ?
                   WHERE id_formateur = ?`,
                  [
                    domaineName,
                    JSON.stringify(updatedThemes),
                    formateur.id_formateur
                  ],
                  (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                  }
                );
              }
            );
          });
        });

        await Promise.all(formateurPromises);
        return { id_session, id_formation };
      });

      const results = await Promise.all(sessionPromises);

      // Valider la transaction
      db.commit((err) => {
        if (err) {
          return db.rollback(() => {
            throw err;
          });
        }

        return res.status(201).json({
          message: 'Domaine, thèmes et formateurs créés avec succès',
          // Retourner tous les IDs de formation créés
          formations: results.map(r => r.id_formation),
          themes,
        });
      });
    } catch (error) {
      // Annuler la transaction en cas d'erreur
      db.rollback(() => {
        console.error("Erreur lors de l'ajout du domaine:", error);
        return res.status(500).json({ 
          error: error.message,
          details: error.stack 
        });
      });
    }
  });
};





  module.exports = {
    addDomain
  };
    