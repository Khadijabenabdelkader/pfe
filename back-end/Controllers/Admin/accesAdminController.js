{/*const db = require('../../connect');



// Récupérer tous les accès
const getAllAccess = (req, res) => {
    const query = 'SELECT * FROM acces';
    db.query(query, (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération des accès:', err);
        res.status(500).json({ error: 'Erreur serveur' });
      } else {
        res.json(results);
      }
    });
};

// Récupérer les accès d'un administrateur spécifique
const getAccesByAdmin = (req, res) => {
  const { id_admin } = req.params;

  const query = 'SELECT nom_acces FROM admin WHERE id_admin = ?';
  db.query(query, [id_admin], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur lors de la récupération des accès.' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Administrateur non trouvé.' });
    }
    res.json(results[0]);
  });
};

// Mettre à jour les accès d'un administrateur spécifique
const updateAccesByAdmin = (req, res) => {
  const { id_admin } = req.params;
  const { id_acces } = req.body; // Nous attendons maintenant l'id_acces

  if (!id_acces) {
    return res.status(400).json({ error: 'Le champ id_acces est obligatoire.' });
  }

  const query = 'UPDATE admin SET id_acces = ? WHERE id_admin = ?'; // Mise à jour de id_acces
  db.query(query, [id_acces, id_admin], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur lors de la mise à jour des accès.' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Administrateur non trouvé.' });
    }
    res.json({ message: 'Accès mis à jour avec succès.' });
  });
};

module.exports = {
    getAllAccess,
    getAccesByAdmin,
    updateAccesByAdmin
};*/}

const accesService = require('../../services/admin/accesService');

class AccesController {
  async getAllAccess(req, res) {
    try {
      const accesses = await accesService.getAllAccess();
      res.json(accesses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAccesByAdmin(req, res) {
    try {
      const access = await accesService.getAdminAccess(req.params.id_admin);
      if (!access) {
        return res.status(404).json({ error: 'Administrateur non trouvé' });
      }
      res.json(access);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateAccesByAdmin(req, res) {
    try {
      const success = await accesService.updateAdminAccess(
        req.params.id_admin,
        req.body.id_acces
      );
      if (!success) {
        return res.status(404).json({ error: 'Administrateur non trouvé' });
      }
      res.json({ message: 'Accès mis à jour avec succès' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new AccesController();