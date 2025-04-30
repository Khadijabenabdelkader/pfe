const db = require('../../connect');

class DomainRepository {
  async beginTransaction() {
    return new Promise((resolve, reject) => {
      db.beginTransaction(err => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  async commit() {
    return new Promise((resolve, reject) => {
      db.commit(err => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  async rollback() {
    return new Promise(resolve => {
      db.rollback(() => resolve());
    });
  }

  async createFormation(domaineName) {
    const [result] = await db.query(
      'INSERT INTO formation (domaine) VALUES (?)',
      [domaineName]
    );
    return result.insertId;
  }

  async createSession(theme, code, id_formation) {
    const [result] = await db.query(
      'INSERT INTO session (theme, code, id_formation) VALUES (?, ?, ?)',
      [theme, code, id_formation]
    );
    return result.insertId;
  }

  async updateFormateur(id_formateur, domaineName, themes) {
    const [results] = await db.query(
      'SELECT themes_a_enseigner FROM formateur WHERE id_formateur = ?',
      [id_formateur]
    );

    let existingThemes = {};
    if (results[0]?.themes_a_enseigner) {
      existingThemes = JSON.parse(results[0].themes_a_enseigner);
    }

    const updatedThemes = {
      ...existingThemes,
      ...themes
    };

    await db.query(
      `UPDATE formateur 
       SET domaine_de_competences = ?,
           themes_a_enseigner = ?
       WHERE id_formateur = ?`,
      [domaineName, JSON.stringify(updatedThemes), id_formateur]
    );
  }
}

module.exports = new DomainRepository();