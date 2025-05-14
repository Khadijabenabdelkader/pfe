const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { getEvents, createEvent, deleteEvent } = require('../../Controllers/Admin/calendrierAdminController');

const CalendrierController = require('../../Controllers/Admin/calendrierAdminController');



const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
  
    if (!token) {
      return res.status(401).json({ error: 'Aucun token fourni' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
  
      if (!decoded.nom_admin) {
        return res.status(403).json({ error: 'Le token ne contient pas nom_admin' });
      }
  
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Erreur de vérification du token:', error);
      return res.status(401).json({ error: 'Token invalide' });
    }
  };

  // Middleware authenticateToken
  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
        return res.status(401).json({ error: 'Token manquant' });
    }
  
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Token invalide' });
        }
  
        // Ajoutez toutes les informations utilisateur nécessaires
        req.user = {
            id: decoded.id,
            nom_complet: decoded.nom_complet,
            email: decoded.email
            // Ajoutez d'autres champs si nécessaire
        };
        
        next();
    });
  };
  
 // Utilisez le même middleware pour toutes les routes
router.get('/api/calendrier', authenticateToken, CalendrierController.getEvents);
router.post('/api/calendrier', authenticateToken, CalendrierController.createEvent); // Ajout du middleware
router.delete('/api/calendrier/:id_event', authenticateToken, CalendrierController.deleteEvent);
module.exports = router;