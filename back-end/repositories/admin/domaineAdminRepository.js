const db = require('../../connect');

class DomaineAdminRepository {
    getAllDomaines() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT DISTINCT domaine FROM domaine';
            
            db.query(sql, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }

    getThemesByDomaine(id_domaine) {  // Renommez le paramètre pour plus de clarté
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT t.theme 
                FROM theme t
                JOIN domaine d ON d.id_domaine = t.id_domaine
                WHERE d.id_domaine = ?
            `;
            
            db.query(sql, [id_domaine], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }
}

module.exports = new DomaineAdminRepository();