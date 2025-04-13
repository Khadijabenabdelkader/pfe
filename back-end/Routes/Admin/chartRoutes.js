const express = require('express');
const router = express.Router();

const {
    sessionStats,
    avisStats,
    participantStats,
    sessionsPopulaire
}= require('../../Controllers/Admin/chartAdminController');

router.get('/sessions-stats',sessionStats);
router.get('/avis-stats',avisStats);
router.get('/participants-stats',participantStats);
router.get('/sessions-populaires',sessionsPopulaire);

module.exports = router;