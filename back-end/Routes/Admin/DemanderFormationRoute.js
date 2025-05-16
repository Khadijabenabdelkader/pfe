const express = require('express');
const router = express.Router();
const  DemanderFormation  = require('../../Controllers/Admin/DemanderFormationAdminController');

router.get('/',DemanderFormation.getAll);
module.exports = router;