const jwt = require('jsonwebtoken');
const authAdminRepository = require('../../repositories/admin/authAdminRepository');

class AuthAdminService {
  async login(nom_admin, password) {
    const admin = await authAdminRepository.findByUsername(nom_admin);
    if (!admin) {
      throw new Error('Identifiants incorrects');
    }

    const isMatch = await authAdminRepository.comparePasswords(password, admin.mdp_admin);
    if (!isMatch) {
      throw new Error('Identifiants incorrects');
    }

    const token = jwt.sign(
      { 
        id: admin.id_admin, 
        nom_admin: admin.nom_admin, 
        nom_acces: admin.nom_acces 
      },
      process.env.SECRET_KEY,
      { expiresIn: '1h' }
    );

    return {
      token,
      admin: {
        id_admin: admin.id_admin,
        nom_admin: admin.nom_admin,
        telephone: admin.telephone,
        poste: admin.poste,
        nom_acces: admin.nom_acces
      }
    };
  }

  logout() {
    return { message: 'Déconnexion réussie' };
  }
}

module.exports = new AuthAdminService();