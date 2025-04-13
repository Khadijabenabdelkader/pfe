const express = require('express');
const router = express.Router();
const {
  getAccesByAdmin,
  updateAccesByAdmin,
  getAllAccess,
} = require('../../Controllers/Admin/accesAdminController');


router.get('/apiAdmin/acces', getAllAccess);
// Route pour obtenir les accès d'un administrateur
router.get('/apiAdmin/admin/:id_admin/acces', getAccesByAdmin);

// Route pour mettre à jour les accès d'un administrateur
router.put('/apiAdmin/admin/:id_admin/acces', updateAccesByAdmin);
module.exports = router;
