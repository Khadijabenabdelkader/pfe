{/*const bcrypt = require('bcrypt');
const db = require('../../connect');


const addAdmin = (req, res) => {
  const { nom_admin, email_admin, mdp_admin, confirm_mdp, acces, telephone, poste } = req.body;


  if (![1, 2, 3, 4].includes(Number(acces))) {
    return res.status(400).json({ message: 'Accès invalide.' });
  }
  if (mdp_admin !== confirm_mdp) {
    return res.status(400).json({ message: 'Les mots de passe ne correspondent pas.' });
  }

  // Hachage du mot de passe avant de l'enregistrer
  bcrypt.hash(mdp_admin, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Erreur lors du hachage du mot de passe :', err);
      return res.status(500).json({ message: 'Erreur interne du serveur.' });
    }

    // Vérification si l'email existe déjà dans la base de données
    db.query('SELECT * FROM admin WHERE email_admin = ?', [email_admin], (err, result) => {
      if (err) {
        console.error('Erreur lors de la vérification de l\'email :', err);
        return res.status(500).json({ message: 'Erreur interne du serveur.' });
      }

      if (result.length > 0) {
        return res.status(400).json({ message: 'Un administrateur avec cet email existe déjà.' });
      }

      // Définir id_acces en fonction de l'accès choisi
      let accessRole = '';
      let accessId = 0;

      switch (acces) {
        case '1':
          accessRole = 'visiteur';
          accessId = 1; // Visitor
          break;
        case '2':
          accessRole = 'editeur formateur';
          accessId = 2; // Formator editor
          break;
        case '3':
          accessRole = 'editeur formation';
          accessId = 3; // Training editor
          break;
        case '4':
          accessRole = 'super_admin';
          accessId = 4; // Super admin
          break;
        default:
          return res.status(400).json({ message: 'Accès invalide.' });
      }

      // Insertion de l'administrateur avec le mot de passe haché
      db.query(
        'INSERT INTO admin (nom_admin, email_admin, mdp_admin, telephone, poste, id_acces) VALUES (?, ?, ?, ?, ?, ?)',
        [nom_admin, email_admin, hashedPassword, telephone, poste, accessId],
        (err, insertResult) => {
          if (err) {
            console.error('Erreur lors de l\'ajout de l\'administrateur :', err);
            return res.status(500).json({ message: 'Erreur interne du serveur.' });
          }

          // Renvoyer l'ensemble des informations de l'utilisateur
          res.status(201).json({
            message: 'Administrateur ajouté avec succès.',
            id_admin: insertResult.insertId,
            nom_admin,
            email_admin,
            telephone,
            poste,
            id_acces: accessId
          });
        }
      );
    });
  });
};

const getAllAdmins = (req, res) => {
  db.query(
    'SELECT admin.*, acces.nom_acces FROM admin LEFT JOIN acces ON admin.id_acces = acces.id_acces',
    (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération des administrateurs :', err);
        return res.status(500).json({ message: 'Erreur lors de la récupération des administrateurs.' });
      }
      res.status(200).json(results);
    }
  );
  
};

const updateAdmin = (req, res) => {
  const { id_admin } = req.params;
  const { email_admin, telephone, poste, password } = req.body;

  if (!id_admin) {
    return res.status(400).json({ message: "L'ID de l'administrateur est requis." });
  }

  if (!email_admin || !telephone || !poste) {
    return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
  }

  db.query('SELECT * FROM admin WHERE id_admin = ?', [id_admin], (err, result) => {
    if (err) {
      console.error('Erreur lors de la vérification de l\'ID de l\'administrateur :', err);
      return res.status(500).json({ message: 'Erreur interne du serveur.' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Administrateur non trouvé.' });
    }

    let hashedPassword = null;
    if (password) {
      hashedPassword = bcrypt.hashSync(password, 10);
    }

    const updateQuery = 'UPDATE admin SET email_admin = ?, telephone = ?, poste = ?, mdp_admin = ? WHERE id_admin = ?';
    db.query(updateQuery, [email_admin, telephone, poste, hashedPassword, id_admin], (err, updateResult) => {
      if (err) {
        console.error('Erreur lors de la mise à jour de l\'administrateur :', err);
        return res.status(500).json({ message: 'Erreur interne du serveur.' });
      }

      if (updateResult.affectedRows > 0) {
        res.status(200).json({ message: 'Informations de l\'administrateur mises à jour avec succès.' });
      } else {
        res.status(400).json({ message: 'Aucune modification effectuée.' });
      }
    });
  });
};

module.exports = { addAdmin, getAllAdmins, updateAdmin };
*/}
const adminService = require('../../services/admin/adminService');

class AdminController {
  async addAdmin(req, res) {
    try {
      const newAdmin = await adminService.createAdmin(req.body);
      res.status(201).json({
        message: 'Administrateur ajouté avec succès',
        admin: newAdmin
      });
    } catch (error) {
      console.error('Erreur:', error.message);
      const status = error.message.includes('existe déjà') ? 400 : 500;
      res.status(status).json({ message: error.message });
    }
  }

  async getAllAdmins(req, res) {
    try {
      const admins = await adminService.getAllAdmins();
      res.status(200).json(admins);
    } catch (error) {
      console.error('Erreur dans AdminController:', error);
      res.status(500).json({ 
        message: 'Erreur serveur lors de la récupération des administrateurs',
        error: error.message 
      });
    }
  }

  async updateAdmin(req, res) {
    try {
      const updatedAdmin = await adminService.updateAdmin(req.params.id_admin, req.body);
      if (updatedAdmin) {
        res.status(200).json({ 
          message: 'Informations mises à jour avec succès',
          admin: updatedAdmin
        });
      } else {
        res.status(400).json({ message: 'Aucune modification effectuée' });
      }
    } catch (error) {
      console.error('Erreur:', error.message);
      const status = error.message.includes('non trouvé') ? 404 : 
                    error.message.includes('obligatoires') ? 400 : 500;
      res.status(status).json({ message: error.message });
    }
  }
}

module.exports = new AdminController();