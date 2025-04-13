const express = require('express');
const router = express.Router();
const { getAvis } = require('../../Controllers/Admin/avisParAdminController');

router.get('/avisP/:idSession',getAvis);
module.exports = router;
