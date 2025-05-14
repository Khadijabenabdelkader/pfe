//const commandeService = require('../../services/admin/CommandeService');
class CommandeController {
    constructor(commandeService) {
      this.commandeService = commandeService;
    }
  
    async sendMail(req, res) {
      const { subject, body, email } = req.body;
  
      try {
        await this.commandeService.sendMail(subject, body, email);
        res.status(200).send('Email envoyé avec succès');
      } catch (error) {
        console.error("Controller Error:", error);
        res.status(error.message === 'Subject, body et email sont requis' ? 400 : 500)
           .send(error.message);
      }
    }
  }
  
  module.exports = CommandeController;