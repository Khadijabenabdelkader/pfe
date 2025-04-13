const db = require('../../connect');

const getEvents = (req, res) => {
  db.query('SELECT * FROM calendrier', (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des événements :', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.status(200).json(results);
  });
};

const createEvent = (req, res) => {
  const { title, date, created_by } = req.body;
  const query = 'INSERT INTO calendrier (title, date, created_by) VALUES (?, ?, ?);'

  db.query(query, [title, date, created_by], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'ajout de l\'événement :', err);
      return res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'événement' });
    }

    const newEvent = {
      id: result.insertId, title,date, created_by, };

    return res.status(201).json(newEvent);
  });
};


const deleteEvent = (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }
  
    const { id } = req.params;
    const createdBy = req.user.nom_admin; // Récupération de l'utilisateur connecté
  
    db.query('DELETE FROM calendrier WHERE id = ? AND created_by = ?', [id, createdBy], (err, results) => {
      if (err) {
        console.error('Erreur lors de la suppression de l\'événement :', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      if (results.affectedRows === 0) {
        return res.status(403).json({ error: 'Vous ne pouvez supprimer que vos propres événements' });
      }
      res.status(200).json({ message: 'Événement supprimé avec succès' });
    });
  };


module.exports = { getEvents, createEvent, deleteEvent };