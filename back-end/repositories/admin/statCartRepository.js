const db = require('../../connect');

class StatsRepository {
  async getAdminStats() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          COUNT(*) as total_admins,
          SUM(CASE WHEN id_acces != 4 THEN 1 ELSE 0 END) as admins,
          SUM(CASE WHEN id_acces = 4 THEN 1 ELSE 0 END) as super_admins
        FROM admin
      `;
      
      db.query(query, (error, results) => {
        if (error) return reject(error);
        resolve(results[0]);
      });
    });
  }

  async getSessionStats() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          id_cal,
          COUNT(*) AS nombre_sessions,
          GROUP_CONCAT(mois ORDER BY id SEPARATOR ', ') AS mois_concaténés
        FROM calendrierformation
        WHERE id_domaine IS NOT NULL AND date_debut IS NOT NULL
        GROUP BY id_cal
        ORDER BY id_cal
      `;
      
      db.query(query, (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
  }
}

module.exports = new StatsRepository();