const accesRepository = require('../../repositories/admin/accesRepository');

class AccesService {
  async getAllAccess() {
    try {
      return await accesRepository.getAll();
    } catch (error) {
      console.error('Erreur dans AccesService.getAllAccess:', error);
      throw new Error('Échec de la récupération des accès');
    }
  }

  async getAdminAccess(id_admin) {
    try {
      if (!id_admin) throw new Error('ID admin manquant');
      return await accesRepository.getByAdmin(id_admin);
    } catch (error) {
      console.error('Erreur dans AccesService.getAdminAccess:', error);
      throw new Error('Échec de la récupération des accès admin');
    }
  }

  async updateAdminAccess(id_admin, id_acces) {
    try {
      if (!id_admin || !id_acces) {
        throw new Error('ID admin ou ID accès manquant');
      }
      return await accesRepository.updateAdminAccess(id_admin, id_acces);
    } catch (error) {
      console.error('Erreur dans AccesService.updateAdminAccess:', error);
      throw new Error('Échec de la mise à jour des accès');
    }
  }
}

module.exports = new AccesService();