const db = require('../../connect');
const Event = require('../../models/admin/evenement');

class EventRepository {

async getAll() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM calendrier', (err, results) => {
        if (err) {
          console.error('Erreur dans EventRepository.getAll:', err);
          return reject(err);
        }
        resolve(results.map(row => new Event({
          id: row.id,
          title: row.title,
          date: row.date,
          created_by: row.created_by
        })));
      });
    });
  }

  async create(title, date, createdBy) {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO calendrier (title, date, created_by) VALUES (?, ?, ?)';
      db.query(query, [title, date, createdBy], (err, result) => {
        if (err) {
          console.error('Erreur dans EventRepository.create:', err);
          return reject(err);
        }
        resolve(new Event({
          id: result.insertId,
          title,
          date,
          created_by: createdBy
        }));
      });
    });
  }

  async delete(id, createdBy) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM calendrier WHERE id = ? AND created_by = ?';
      db.query(query, [id, createdBy], (err, result) => {
        if (err) {
          console.error('Erreur dans EventRepository.delete:', err);
          return reject(err);
        }
        resolve(result.affectedRows > 0);
      });
    });
  }
}

module.exports = new EventRepository();

