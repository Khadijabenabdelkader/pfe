const express = require('express');
const { stockerAvis,
    getSessions } = require('../../Controllers/User/AvisUserController');
const router = express.Router();

// Route pour récupérer les sessions auxquelles un participant a participé
router.get('/sessions', getSessions);

// Route pour uploader le fichier PDF rempli
router.post('/avisParticipant', stockerAvis);
module.exports = router;