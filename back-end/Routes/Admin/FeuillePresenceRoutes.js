const express = require('express');
const router = express.Router();
const { 
    addParticipantAndInsertPresence,
    getSessionDetails,
    getCalendrier
 } = require('../../Controllers/Admin/FeuillePresenceController');

router.get('/sessionDetails',getSessionDetails);
router.get('/calendrierDetails',getCalendrier);
router.post('/feuillePresence',addParticipantAndInsertPresence);

module.exports = router;