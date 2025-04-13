const express = require('express');
const router = express.Router();
const { sendMail } = require('../../Controllers/User/contactController');

// Route pour le formulaire de contact
router.post('/contact', sendMail);

module.exports = router;
