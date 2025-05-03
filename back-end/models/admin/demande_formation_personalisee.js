class DemandeFormation {
    constructor({
      id,
      theme,
      formateur,
      niveau,
      domaine,
      nombreParticipants,
      details,
      mode,
      id_participant
    }) {
      this.id = id;
      this.formateur = formateur;
      this.niveau = niveau;
      this.domaine = domaine;
      this.theme = theme;
      this.nombreParticipants = nombreParticipants;
      this.details = details;
      this.	mode = 	mode;
      this.id_participant = id_participant;

    }
  }
  
  module.exports = DemandeFormation;