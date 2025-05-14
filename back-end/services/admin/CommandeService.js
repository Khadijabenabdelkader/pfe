//const commandeRepository = require('../../repositories/admin/CommandeRepository');
class CommandeService {
    constructor(commandeRepository) {
      this.commandeRepository = commandeRepository;
    }
  
    async sendMail(subject, body, email) {
      if (!subject || !body || !email) {
        throw new Error('Subject, body et email sont requis');
      }
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        text: body
      };
  
      try {
        const result = await this.commandeRepository.sendEmail(mailOptions);
        return result;
      } catch (error) {
        console.error("Service Error:", error);
        throw error;
      }
    }
  }
  
  module.exports = CommandeService;