class participants {
  constructor({
    id_participant,
    nom_complet,
    mail,
    pwd,
    telephone,
    adresse,
    CIN,
    id_entreprise,
  }) {
    this.id_participant = id_participant;
    this.nom_complet = nom_complet;
    this.mail = mail;
    this.pwd = pwd;
    this.telephone = telephone;
    this.adresse = adresse;
    this.CIN = CIN;
    this.id_entreprise = id_entreprise;
  }
}

module.exports = participants;