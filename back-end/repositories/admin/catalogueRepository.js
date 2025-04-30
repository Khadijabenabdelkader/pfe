const db = require('../../connect');
const { Formation, Session, Formateur } = require('../../models');

class CatalogueRepository {


  async getFullCatalogue() {
    const query = `
      SELECT f.domaine, f.id_formation,
      s.id_session, s.code, s.theme, 
      /* autres champs */
      FROM formation f 
      LEFT JOIN session s ON f.id_formation = s.id_formation
      /* autres joins */
    `;
    const [rows] = await db.query(query);
    return rows;
  }

  async getFormateursBySession(id_session) {
    const [session] = await db.query(
      'SELECT theme FROM session WHERE id_session = ?', 
      [id_session]
    );
    
    if (!session) return null;

    const [formateurs] = await db.query(
      `SELECT id_formateur, nom_complet, themes_a_enseigner
       FROM formateur 
       WHERE JSON_CONTAINS(JSON_KEYS(themes_a_enseigner), JSON_QUOTE(?))`,
      [session.theme]
    );

    return {
      session,
      formateurs: formateurs.map(f => new Formateur(f))
    };
  }

  async updateDomain(id_formation, domaine, sessions) {
        const { formation, sessions } = req.body;
        const { id_formation } = req.params;
      
        db.beginTransaction(async (err) => {
          if (err) {
            return res.status(500).json({ error: "Erreur de transaction" });
          }
      
          try {
            // 1. Mettre à jour le domaine dans la table formation
            const queryUpdateFormation = 'UPDATE formation SET domaine = ? WHERE id_formation = ?';
            await new Promise((resolve, reject) => {
              db.query(queryUpdateFormation, [formation, id_formation], (err, result) => {
                if (err) return reject(err);
                resolve(result);
              });
            });
      
            // 2. Récupérer les sessions existantes
            const existingSessions = await new Promise((resolve, reject) => {
              db.query('SELECT id_session, theme, code FROM session WHERE id_formation = ?', [id_formation], (err, results) => {
                if (err) return reject(err);
                resolve(results);
              });
            });
      
            // 3. Identifier les thèmes qui vont être supprimés
            const currentThemeCodes = sessions.map(t => t.code);
            const themesToDelete = existingSessions.filter(s => !currentThemeCodes.includes(s.code));
            const deletedThemeNames = themesToDelete.map(t => t.theme);
      
            // 4. Traiter chaque session/thème
            const sessionPromises = sessions.map(async (session) => {
              const { theme, code, formateurs } = session;
      
              // Trouver ou créer la session
              let existingSession = existingSessions.find(s => s.code === code);
              let id_session;
      
              if (existingSession) {
                // Mettre à jour la session existante
                const queryUpdateSession = 'UPDATE session SET theme = ? WHERE id_session = ?';
                await new Promise((resolve, reject) => {
                  db.query(queryUpdateSession, [theme, existingSession.id_session], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                  });
                });
                id_session = existingSession.id_session;
              } else {
                // Créer une nouvelle session
                const queryInsertSession = 'INSERT INTO session (theme, code, id_formation) VALUES (?, ?, ?)';
                const insertResult = await new Promise((resolve, reject) => {
                  db.query(queryInsertSession, [theme, code, id_formation], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                  });
                });
                id_session = insertResult.insertId;
              }
      
              // 5. Mettre à jour les thèmes enseignés par chaque formateur
              const formateurPromises = formateurs.map(async (formateur) => {
                // Récupérer les données actuelles du formateur
                const formateurData = await new Promise((resolve, reject) => {
                  db.query(
                    'SELECT themes_a_enseigner FROM formateur WHERE id_formateur = ?',
                    [formateur.id_formateur],
                    (err, results) => {
                      if (err) return reject(err);
                      resolve(results[0]);
                    }
                  );
                });
      
                // Parser les thèmes existants ou initialiser un objet vide
                let existingThemes = {};
                if (formateurData?.themes_a_enseigner) {
                  try {
                    existingThemes = JSON.parse(formateurData.themes_a_enseigner);
                  } catch (e) {
                    console.error("Erreur parsing JSON:", e);
                  }
                }
      
                // Mettre à jour seulement le thème actuel avec son rang
                const updatedThemes = {
                  ...existingThemes,
                  [theme]: formateur.rang,
                };
      
                // Mettre à jour le formateur
                await new Promise((resolve, reject) => {
                  db.query(
                    `UPDATE formateur 
                     SET domaine_de_competences = ?,
                         themes_a_enseigner = ?
                     WHERE id_formateur = ?`,
                    [
                      formation,
                      JSON.stringify(updatedThemes),
                      formateur.id_formateur,
                    ],
                    (err, result) => {
                      if (err) return reject(err);
                      resolve(result);
                    }
                  );
                });
              });
      
              // 6. Nettoyer les thèmes supprimés pour les formateurs non inclus dans cette session
              const currentFormateurIds = formateurs.map(f => f.id_formateur);
              const allFormateurs = await new Promise((resolve, reject) => {
                db.query(
                  'SELECT id_formateur, themes_a_enseigner FROM formateur',
                  (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                  }
                );
              });
      
              const cleanupPromises = allFormateurs.map(async (formateur) => {
                if (!formateur.themes_a_enseigner) return;
      
                try {
                  let themes = JSON.parse(formateur.themes_a_enseigner);
                  let updatedThemes = {};
      
                  // Garder seulement les thèmes qui n'ont pas été supprimés
                  for (const [themeName, rang] of Object.entries(themes)) {
                    if (themeName !== theme || currentFormateurIds.includes(formateur.id_formateur)) {
                      updatedThemes[themeName] = rang;
                    }
                  }
      
                  // Mettre à jour le formateur si les thèmes ont changé
                  if (Object.keys(themes).length !== Object.keys(updatedThemes).length) {
                    await new Promise((resolve, reject) => {
                      db.query(
                        'UPDATE formateur SET themes_a_enseigner = ? WHERE id_formateur = ?',
                        [JSON.stringify(updatedThemes), formateur.id_formateur],
                        (err, result) => {
                          if (err) return reject(err);
                          resolve(result);
                        }
                      );
                    });
                  }
                } catch (e) {
                  console.error("Erreur lors du traitement des thèmes du formateur:", e);
                }
              });
      
              await Promise.all([...formateurPromises, ...cleanupPromises]);
            });
      
            await Promise.all(sessionPromises);
      
            // 7. Supprimer les sessions qui n'existent plus
            const deletePromises = themesToDelete.map(session => {
              return new Promise((resolve, reject) => {
                db.query('DELETE FROM session WHERE id_session = ?', [session.id_session], (err, result) => {
                  if (err) return reject(err);
                  resolve(result);
                });
              });
            });
      
            await Promise.all(deletePromises);
      
            // Valider la transaction
            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  throw err;
                });
              }
      
              return res.status(200).json({
                message: 'Domaine, thèmes et formateurs mis à jour avec succès',
                id_formation: id_formation,
                sessions,
              });
            });
          } catch (error) {
            db.rollback(() => {
              console.error("Erreur lors de la mise à jour du domaine:", error);
              return res.status(500).json({ 
                error: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
              });
            });
          }
        });
      
  }

  async addThemeToDomain(domaineName, themes) {
    // Implémentez la logique d'ajout de thème

        const { domaineName, abbreviation, themes } = req.body;
        
        // Vérifier que l'abréviation est bien définie
        const abbreviationToUse = abbreviation || '';
        
        // Démarrer une transaction
        db.beginTransaction(async (err) => {
          if (err) {
            return res.status(500).json({ error: "Erreur de transaction" });
          }
      
          try {
            // Vérifier d'abord si le domaine existe déjà
            const checkDomain = await new Promise((resolve, reject) => {
              db.query('SELECT domaine FROM formation WHERE domaine = ? LIMIT 1', [domaineName], (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
              });
            });
      
            if (!checkDomain) {
              return res.status(404).json({ error: "Domaine non trouvé" });
            }
      
            // Récupérer le dernier code de thème pour ce domaine (tous codes confondus)
            const lastCodeQuery = `
              SELECT s.code 
              FROM session s
              JOIN formation f ON s.id_formation = f.id_formation
              WHERE f.domaine = ?
              ORDER BY 
                LENGTH(s.code) DESC,  -- Priorité aux codes les plus longs
                s.code DESC          -- Puis tri alphabétique inverse
              LIMIT 1
            `;
            
            console.log("Query parameters:", [domaineName]);
            
            const lastCodeResult = await new Promise((resolve, reject) => {
              db.query(lastCodeQuery, [domaineName], (err, results) => {
                if (err) return reject(err);
                console.log("Last code query results:", results);
                resolve(results[0]);
              });
            });
      
            let lastNumber = 0;
            let existingPrefix = abbreviationToUse;
      
            if (lastCodeResult && lastCodeResult.code) {
              console.log("Found last code:", lastCodeResult.code);
              // Extraire le préfixe et le numéro avec une regex améliorée
              const match = lastCodeResult.code.match(/^([A-Za-z]*)(\d+)$/);
              console.log("Regex match:", match);
              
              if (match) {
                existingPrefix = match[1] || abbreviationToUse;
                lastNumber = parseInt(match[2], 10);
                console.log("Last number extracted:", lastNumber);
                console.log("Using prefix:", existingPrefix);
              }
            } else {
              console.log("No previous code found, starting at 1");
            }
      
            // Insérer les thèmes
            const sessionPromises = themes.map(async (theme, index) => {
              const { name, formateurs } = theme;
              
              // Incrémenter le numéro pour le nouveau code
              const nextNumber = lastNumber + 1;
              lastNumber = nextNumber; // Mettre à jour pour le prochain thème
              console.log(`Generating code for theme ${index + 1}: nextNumber = ${nextNumber}`);
              
              // Formater le numéro avec des zéros en préfixe (3 chiffres minimum)
              const formattedNumber = String(nextNumber).padStart(3, '0');
              const code = `${existingPrefix}${formattedNumber}`;
              console.log(`Generated code: ${code}`);
              
              // Créer une entrée dans la table formation
              const formationResult = await new Promise((resolve, reject) => {
                db.query('INSERT INTO formation (domaine) VALUES (?)', [domaineName], (err, result) => {
                  if (err) return reject(err);
                  resolve(result);
                });
              });
              const new_id_formation = formationResult.insertId;
      
              // Insérer le thème dans la table session
              const querySession = 'INSERT INTO session (theme, code, id_formation) VALUES (?, ?, ?)';
              console.log("Inserting session with params:", [name, code, new_id_formation]);
              
              const sessionResult = await new Promise((resolve, reject) => {
                db.query(querySession, [name, code, new_id_formation], (err, result) => {
                  if (err) return reject(err);
                  resolve(result);
                });
              });
              const id_session = sessionResult.insertId;
      
              // Mettre à jour les formateurs
              const formateurPromises = formateurs.map((formateur) => {
                const themeEnseignement = { [name]: formateur.rang };
      
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
                        [domaineName, JSON.stringify(updatedThemes), formateur.id_formateur],
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
              return { 
                id_session, 
                id_formation: new_id_formation,
                theme: name,
                code: code
              };
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
                message: 'Thèmes créés avec succès',
                results: results.map(r => ({
                  id_formation: r.id_formation,
                  id_session: r.id_session,
                  theme: r.theme,
                  code: r.code
                })),
                domaine: domaineName
              });
            });
          } catch (error) {
            // Annuler la transaction en cas d'erreur
            db.rollback(() => {
              console.error("Erreur lors de l'ajout des thèmes:", error);
              return res.status(500).json({ 
                error: error.message,
                details: error.stack 
              });
            });
          }
        });
      };
      
      




  }


module.exports = new CatalogueRepository();