const express = require('express');
const router = express.Router();
const demanderFormationController = require('../../Controllers/User/demanderFormationUserController');
router.post('/',demanderFormationController.DemanderFormation);
module.exports = router;