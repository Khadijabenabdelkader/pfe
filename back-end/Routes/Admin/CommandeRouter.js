const express = require('express');
const router = express.Router();
const CommandeController = require('../../Controllers/Admin/CommandeController');
const CommandeService = require('../../services/admin/CommandeService');
const CommandeRepository = require('../../repositories/admin/CommandeRepository');

// Injection des dépendances
const commandeRepository = new CommandeRepository();
const commandeService = new CommandeService(commandeRepository);
const commandeController = new CommandeController(commandeService);

router.post('/send-email', commandeController.sendMail.bind(commandeController));

module.exports = router;