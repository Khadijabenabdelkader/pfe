const express = require('express');
const router = express.Router();
const { addAdmin, getAllAdmins,updateAdmin, getAdminProfile } = require('./../../Controllers/Admin/adminController');


const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Authentification requise' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id_admin: decoded.id_admin,
      nom_admin: decoded.nom_admin,
      email_admin: decoded.email_admin,
      id_acces: decoded.id_acces
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
};

// Route pour ajouter un administrateur
router.post('/', addAdmin);
router.get('/',getAllAdmins);
router.put('/:id_admin', updateAdmin);
//router.get('/:id_admin', verifyToken, getAdminProfile);

module.exports = router;
