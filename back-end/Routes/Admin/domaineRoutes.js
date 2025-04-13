const express = require('express');
const router = express.Router();
const domaineController = require('../Controllers/Admin/domaineController');
router.get('/domaine/Domains', domaineController.getDomains);
module.exports = router;
