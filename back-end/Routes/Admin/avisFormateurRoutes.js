const express = require('express');
const router = express.Router();
const { getAvisFormateur } = require('../../Controllers/Admin/avisForController');

router.get('/avisF/:idSession',getAvisFormateur);
module.exports = router;
