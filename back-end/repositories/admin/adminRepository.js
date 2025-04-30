const db = require('../../connect');
const Admin = require('../../models/admin/admin');

class AdminRepository {
  constructor() {
    this.initTable();
  }

  async initTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS admin (
        id_admin INT PRIMARY KEY AUTO_INCREMENT,
        nom_admin VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        mot_de_passe VARCHAR(255) NOT NULL,
        id_acces INT,
        FOREIGN KEY (id_acces) REFERENCES acces(id_acces)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    return new Promise((resolve, reject) => {
      db.query(createTableQuery, (err) => {
        if (err) {
          console.error('❌ Erreur création table admin:', err);
          return reject(err);
        }
        console.log('✅ Table admin initialisée');
        resolve();
      });
    });
  }

  async getAllAdmins() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT a.*, ac.nom_acces 
        FROM admin a
        LEFT JOIN acces ac ON a.id_acces = ac.id_acces
      `;
      
      db.query(query, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  // ... autres méthodes (getById, create, update, delete)
}

module.exports = new AdminRepository();