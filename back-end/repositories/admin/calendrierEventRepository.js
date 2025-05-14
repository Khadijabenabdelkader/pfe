const db = require('../../connect');
const Event = require('../../models/admin/evenement');

class EventRepository {

  async getAllEvents() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM event', (err, results) => {
        if (err) {
          console.error('Repository Error - getAllEvents:', err);
          return reject(new Error('Database error while fetching events'));
        }
        resolve(results);
      });
    });
  }

  async createEvent(event, date, created_by) {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO event (event, date, created_by) VALUES (?, ?, ?)';
      
      db.query(query, [event, date, created_by], (err, result) => {
        if (err) {
          console.error('Repository Error - createEvent:', err);
          return reject(new Error('Database error while creating event'));
        }
        
        resolve({
          id: result.insertId,
          event,
          date,
          created_by
        });
      });
    });
  }

  async deleteEvent(id_event, created_by) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM event WHERE id_event = ? AND created_by = ?';
      db.query(query, [id_event, created_by], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }
}

module.exports = new EventRepository();

