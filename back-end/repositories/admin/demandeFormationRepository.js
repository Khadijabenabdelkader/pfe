const db = require('../../connect');

class DemandeFormationRepository {
  async getAll() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM demande_de_formation_personnalisee', (err, results) => {
        if (err) {
          console.error('Erreur DB:', err);
          return reject(err);
        }
        resolve(results);
      });
    });
  }
}

// Exportez bien une instance
module.exports = new DemandeFormationRepository();