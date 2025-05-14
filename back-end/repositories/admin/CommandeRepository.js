const nodemailer = require('nodemailer');

class CommandeRepository {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'khadijabenabdelkader1206@gmail.com', // Utilisation des variables d'environnement
        pass: 'qqij aava gtxv hpdz'
      }
    });
  }

  async sendEmail(mailOptions) {
    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error("Repository Error:", error);
      throw error;
    }
  }
}

module.exports = CommandeRepository;