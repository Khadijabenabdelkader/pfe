class DemandeFormation {
    constructor({
      id,
      theme,
      //nom_complet,
      contactMail,
      formateur,
      contactTel,
      niveau,
      domaine,
      nombreParticipants,
      quiDemande,
      matricule,
      description,
      genre,
      createdAt
    }) {
      this.id = id;
     // this.nom_complet = nom_complet;
      this.formateur = formateur;
      this.	contactMail = 	contactMail;
      this.contactTel = contactTel;
      this.niveau = niveau;
      this.domaine = domaine;
      this.theme = theme;
      this.nombreParticipants = nombreParticipants;
      this.quiDemande = quiDemande;
      this.matricule = matricule;
      this.description = description;
      this.	genre = 	genre;
      this.	createdAt = 	createdAt;
    }
  }
  
  module.exports = DemandeFormation;