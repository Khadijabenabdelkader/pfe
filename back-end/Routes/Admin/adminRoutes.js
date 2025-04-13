const express = require('express');
const router = express.Router();
const { addAdmin, getAllAdmins,updateAdmin } = require('./../../Controllers/Admin/adminController');

// Route pour ajouter un administrateur
router.post('/', addAdmin);
router.get('/',getAllAdmins);
router.put('/:id_admin', updateAdmin);
module.exports = router;
