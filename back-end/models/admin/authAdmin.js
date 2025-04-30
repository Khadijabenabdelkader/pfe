class AuthAdmin {
    constructor(id_admin, nom_admin, mdp_admin, telephone, poste, nom_acces) {
      this.id_admin = id_admin;
      this.nom_admin = nom_admin;
      this.mdp_admin = mdp_admin;
      this.telephone = telephone;
      this.poste = poste;
      this.nom_acces = nom_acces;
    }
  
    validateCredentials() {
      if (!this.nom_admin || !this.mdp_admin) {
        throw new Error('Nom et mot de passe requis');
      }
    }
  }
  
  module.exports = AuthAdmin;