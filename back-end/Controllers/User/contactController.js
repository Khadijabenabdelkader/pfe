const ContactService = require('../../services/User/ContactService');

class ContactController {
  constructor() {
    this.contactService = new ContactService(); // Initialisation du service
  }

  async sendMail(req, res) {
    const { nom, email, message } = req.body;
    console.log('Données reçues:', { nom, email, message });

    try {
      // Appel correct de la méthode d'instance
      await this.contactService.sendContactEmail(nom, email, message);
      return res.status(200).json({ 
        success: true, 
        message: 'Email envoyé avec succès',
        data: { nom, email }
      });
    } catch (error) {
      console.error('ContactController error:', error);
      const statusCode = error.message === 'Nom, email et message sont requis' ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message || 'Erreur lors de l\'envoi de l\'email',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
}

module.exports = ContactController;