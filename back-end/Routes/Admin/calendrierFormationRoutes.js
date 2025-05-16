/*const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { createCalendrierformation,
    deleteCalendrierFormation,
    getcalformation,deleteSessionFromCalendrier,
    addSessionToCalendrier,
    } = require('../../Controllers/Admin/calendrierFormationController');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
  
    if (!token) {
      return res.status(401).json({ error: 'Aucun token fourni' });
    }
  
    try {
      console.log('Token reçu :', token);
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      console.log('Token décodé :', decoded);
  
      if (!decoded.nom_admin) {
        return res.status(403).json({ error: 'Le token ne contient pas nom_admin' });
      }
  
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Erreur de vérification du token:', error);
      return res.status(401).json({ error: 'Token invalide' });
    }
  };
  
  
router.get('/showcalendrier/:id_cal',getcalformation);
router.post('/create/calendrierformation', createCalendrierformation);
router.delete('/:id', verifyToken, deleteCalendrierFormation);
router.delete('/calendrier/:id_cal/session/:id_session', deleteSessionFromCalendrier);
router.post('/calendrier/:id_cal/session', addSessionToCalendrier);
module.exports = router;

*/const express = require('express');
const router = express.Router();
const{ getDomainesWithSessions,getCalendarSessions, calendrierFormation, deletSessionFromCalendrier}= require('../../Controllers/Admin/calendrierFormationController');
router.post("/sessions/save", calendrierFormation);
router.get("/calendrier", getDomainesWithSessions);
router.get("/SessionCalendrier", getCalendarSessions);
router.delete('/sessions/:id',deletSessionFromCalendrier) 

module.exports = router;