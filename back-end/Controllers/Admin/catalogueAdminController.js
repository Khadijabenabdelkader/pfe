const db = require('../../connect');

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
   LEFT JOIN formateur fm ON JSON_CONTAINS(
      JSON_KEYS(fm.themes_a_enseigner), 
      JSON_QUOTE(s.theme),
      '$'
    )
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
          formateurs: []
        };
        formation.sessions.push(session);
      }

      if (row.id_formateur && session) {
        try {
          // Parser les thèmes du formateur (qui est un JSON string)
          const themesFormateur = row.themes_a_enseigner 
            ? JSON.parse(row.themes_a_enseigner)
            : {};
          
          // Vérifier si le formateur a le thème de la session et récupérer son rang
          if (themesFormateur[row.theme]) {
            const formateur = {
              id_formateur: row.id_formateur,
              nom_complet: row.nom_complet,
              mail: row.mail,
              adr: row.adr,
              domaine_de_competences: row.domaine_de_competences,
              themes_a_enseigner: themesFormateur,
              tarif_journalier: row.tarif_journalier,
              tel: row.tel,
              cv: row.cv,
              niveau_etude: row.niveau_etude,
              nb_experience: row.nb_experience,
              // Ajouter le rang spécifique pour ce thème
              rang: themesFormateur[row.theme]
            };

            // Vérifier si le formateur n'est pas déjà dans la liste
            const formateurExists = session.formateurs.some(
              f => f.id_formateur === row.id_formateur
            );
            
            if (!formateurExists) {
              session.formateurs.push(formateur);
              
              // Trier les formateurs par rang (1 d'abord, puis 2, etc.)
              session.formateurs.sort((a, b) => a.rang - b.rang);
            }
          }
        } catch (e) {
          console.error("Error parsing themes_a_enseigner:", e);
        }
      }
    });

    res.json(Array.from(formationsMap.values()));
  });
};

const getFormateursBySession = async (req, res) => {
  const { id_session } = req.params;


  try {
    // 1. Récupération des informations de la session
    const sessionResults = await new Promise((resolve, reject) => {
      db.query(
        'SELECT id_session, theme FROM session WHERE id_session = ?', 
        [id_session], 
        (err, results) => {
          if (err) {
            console.error('Erreur SQL:', err);
            reject(err);
          } else {

            resolve(results);
          }
        }
      );
    });

    // Vérification améliorée
    if (!Array.isArray(sessionResults) || sessionResults.length === 0) {
      console.log(`Aucune session trouvée pour l'ID ${id_session}`);
      return res.status(404).json({ 
        success: false,
        error: 'Session non trouvée',
        sessionId: id_session
      });
    }

    const sessionTheme = sessionResults[0].theme;
    //console.log(`Thème de la session ${id_session}: ${sessionTheme}`); // Log

    // 2. Récupération des formateurs
    const formateurs = await new Promise((resolve, reject) => {
      const query = `
        SELECT 
          fm.id_formateur,
          fm.nom_complet,
          fm.themes_a_enseigner
        FROM formateur fm
        WHERE JSON_CONTAINS(JSON_KEYS(fm.themes_a_enseigner), JSON_QUOTE(?))
      `;
      
      db.query(query, [sessionTheme], (err, results) => {
        if (err) {
          console.error('Erreur SQL formateurs:', err);
          reject(err);
        } else {

          resolve(results);
        }
      });
    });

    // Formatage des résultats
    const result = formateurs.map(formateur => {
      let rang = 1;
      try {
        const themes = JSON.parse(formateur.themes_a_enseigner);
        rang = themes[sessionTheme] || 1;
      } catch (e) {
        console.error("Erreur parsing themes_a_enseigner:", e);
      }

      return {
        id_formateur: formateur.id_formateur,
        nom_complet: formateur.nom_complet,
        rang: rang
      };
    });

    res.json({
      success: true,
      id_session: parseInt(id_session),
      theme: sessionTheme,
      formateurs: result
    });

  } catch (error) {
    console.error("Erreur complète:", error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};



const updateDomain = async (req, res) => {
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
};

const addThemeToDomain = async (req, res) => {
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



  module.exports = {
    getCatalogue,updateDomain,getFormateursBySession,addThemeToDomain
  };





















{/*}  const catalogueService = require('../../services/admin/catalogueService');

class CatalogueController {
  async getCatalogue(req, res) {
    try {
      const catalogue = await catalogueService.getCatalogue();
      res.json(catalogue);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getFormateursBySession(req, res) {
    try {
      const result = await catalogueService.getFormateursBySession(req.params.id_session);
      res.json(result);
    } catch (error) {
      if (error.message === 'Session non trouvée') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async updateDomain(req, res) {
    try {
      const result = await catalogueService.updateDomain(
        req.params.id_formation,
        req.body
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async addThemeToDomain(req, res) {
    try {
      const result = await catalogueService.addThemeToDomain(
        req.body.domaineName,
        req.body
      );
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new CatalogueController();*/}