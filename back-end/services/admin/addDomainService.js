const db = require('../../connect');

class DomainService {
  async addDomain({ domaineName, abbreviation, themes }) {
    return new Promise((resolve, reject) => {
      db.beginTransaction(async (err) => {
        if (err) return reject(err);

        try {
          const sessionPromises = themes.map(async (theme) => {
            const { name, code, formateurs } = theme;

            const formationResult = await new Promise((resolve, reject) => {
              db.query(
                'INSERT INTO formation (domaine) VALUES (?)',
                [domaineName],
                (err, result) => err ? reject(err) : resolve(result)
              );
            });
            const id_formation = formationResult.insertId;

            // 2. Insérer le thème dans la table session
            const sessionResult = await new Promise((resolve, reject) => {
              db.query(
                'INSERT INTO session (theme, code, id_formation) VALUES (?, ?, ?)',
                [name, code, id_formation],
                (err, result) => err ? reject(err) : resolve(result)
              );
            });
            const id_session = sessionResult.insertId;

            // 3. Mettre à jour les formateurs
            const formateurPromises = formateurs.map((formateur) => {
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
                      [name]: formateur.rang
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
                      (err, result) => err ? reject(err) : resolve(result)
                    );
                  }
                );
              });
            });

            await Promise.all(formateurPromises);
            return { id_session, id_formation };
          });

          const results = await Promise.all(sessionPromises);

          db.commit((err) => {
            if (err) {
              return db.rollback(() => reject(err));
            }
            resolve({
              formations: results.map(r => r.id_formation),
              themes
            });
          });
        } catch (error) {
          db.rollback(() => reject(error));
        }
      });
    });
  }
}

module.exports = new DomainService();