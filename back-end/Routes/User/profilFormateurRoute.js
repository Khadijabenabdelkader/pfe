const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();
const { 
    getFormationsARealiser, 
    getHistoriqueFormations, 
    getFormateurDetails,
    updatePassword,
    getEvents,// createEvent, deleteEvent
    sendModificationRequest,handleModificationResponse
} = require('../../Controllers/User/profilFormateurUserController');

const multer = require("multer");
const path = require("path");

// Configuration de stockage pour multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Assure-toi que ce dossier existe
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Générer un nom de fichier unique
  },
});

const uploads = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB par fichier
}).fields([
  { name: "photo", maxCount: 1 },      // 1 seule photo
  { name: "cv", maxCount: 1 },         // 1 seul CV
  { name: "fichePrg", maxCount: 10 },
  { name: "ficheAvis", maxCount: 20},  
  { name: "fichiers", maxCount: 20}  

]);

// Exemple de route pour servir les fichiers en accès public
router.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Erreur lors de l\'envoi du fichier :', err);
      res.status(404).send('Fichier non trouvé');
    }
  });
});

router.get('/apiUser/formations-a-realiser/:id_formateur', getFormationsARealiser);

router.get('/apiUser/historique-formations/:id_formateur', getHistoriqueFormations);

router.get('/apiUser/formateur/details/:id_formateur', getFormateurDetails);
router.put('/apiUser/formateur/details/:id_formateur', updatePassword);
router.post('/apiUser/modification', uploads, sendModificationRequest);
router.get('/apiUser/modification/response', handleModificationResponse);

const authenticateToken = (req, res, next) => {
    console.log("Token reçu dans la requête :", req.headers.authorization);
  
    if (!req.headers.authorization) {
      return res.status(401).json({ error: "Token manquant" });
    }
  
    const token = req.headers.authorization.split(" ")[1]; // Vérifie que le format est "Bearer TOKEN"
    if (!token) {
      return res.status(401).json({ error: "Token invalide ou mal formaté" });
    }
  
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(401).json({ error: "Token invalide ou expiré" });
      }
      req.user = user;
      next();
    });
  };
  
  router.get('/api/calendrier', authenticateToken, getEvents);
  
  // Route pour créer un nouvel événement (seulement pour un formateur authentifié)
  //router.post('/api/calendrier', createEvent);
  
  // Route pour supprimer un événement (seulement par le formateur ayant créé l'événement)
  //router.delete('/api/calendrier/:id', authenticateToken, deleteEvent);
  
module.exports = router;
