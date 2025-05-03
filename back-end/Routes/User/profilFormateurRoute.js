const express = require('express');
const router = express.Router();
const ProfilFormateurUserController = require('../../Controllers/User/profilFormateurUserController');
const jwt = require('jsonwebtoken');

const controller = new ProfilFormateurUserController();

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

router.get('/apiUser/formations-a-realiser/:id_formateur', (req, res) => controller.getUpcomingSessions(req, res));

router.get('/apiUser/historique-formations/:id_formateur', (req, res) => controller.getHistoricalSessions(req, res));

router.get('/apiUser/formateur/details/:id_formateur', (req, res) => controller.getProfile(req, res));
router.put('/apiUser/formateur/details/:id_formateur', (req, res) => controller.changePassword(req, res));
router.post('/apiUser/modification', uploads, (req, res) => 
  controller.sendModificationRequest(req, res));
router.get('/apiUser/modification/response', (req, res) => controller.handleModificationResponse(req, res));

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
  
  router.get('/api/calendrier', authenticateToken,  (req, res) => controller.getEvents(req, res));
  
  router.post('/api/calendrier', (req, res) => controller.createEvent(req, res));
  
  router.delete('/api/calendrier/:id_event', authenticateToken, (req, res) => controller.deleteEvent(req, res));
  
module.exports = router;
