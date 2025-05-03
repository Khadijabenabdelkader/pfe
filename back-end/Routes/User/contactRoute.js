const express = require('express');
const router = express.Router();
const ContactController = require('../../Controllers/User/contactController');
const contactController = new ContactController(); // Initialisation du contrôleur

// Route pour le formulaire de contact
router.post('/contact', (req, res) => contactController.sendMail(req, res));

module.exports = router;