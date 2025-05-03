
const express = require('express');
const router = express.Router();
const AvisUserController = require('../../Controllers/User/AvisUserController');

const controller = new AvisUserController();

router.post('/avisParticipant', (req, res) => controller.createAvis(req, res));
router.get('/sessions', (req, res) => controller.getSessions(req, res));

module.exports = router;