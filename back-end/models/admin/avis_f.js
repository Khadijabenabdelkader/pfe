class AvisFormateur {
  constructor(data) {
    this.id_avis = data.id_avis;
    this.nom_formateur = data.nom_formateur;
    this.nom_complet = data.nom_complet;
    this.id_presence = data.id_presence;
    this.connaissances_professionnelles = data.connaissances_professionnelles;
    this.connaissances_equipements = data.connaissances_equipements;
    this.comprehension_competences = data.comprehension_competences;
    this.aptitude_appliquer_infos = data.aptitude_appliquer_infos;
    this.rapidite_execution = data.rapidite_execution;
    this.qualite_travaux = data.qualite_travaux;
    this.clarte_pertinence_resultats = data.clarte_pertinence_resultats;
    this.perfectionnement_connaissances = data.perfectionnement_connaissances;
    this.respect_consignes_constructeur = data.respect_consignes_constructeur;
    this.respect_normes_securite = data.respect_normes_securite;
    this.autonomie_travail = data.autonomie_travail;
    this.participation = data.participation;
    this.initiative = data.initiative;
    this.esprit_groupe = data.esprit_groupe;
    this.observation = data.observation;
  }

  toJSON() {
    return {
      id_avis: this.id_avis,
      nom_formateur: this.nom_formateur,
      nom_complet: this.nom_complet,
      id_presence: this.id_presence,
      connaissances_professionnelles: this.connaissances_professionnelles,
      connaissances_equipements: this.connaissances_equipements,
      comprehension_competences: this.comprehension_competences,
      aptitude_appliquer_infos: this.aptitude_appliquer_infos,
      rapidite_execution: this.rapidite_execution,
      qualite_travaux: this.qualite_travaux,
      clarte_pertinence_resultats: this.clarte_pertinence_resultats,
      perfectionnement_connaissances: this.perfectionnement_connaissances,
      respect_consignes_constructeur: this.respect_consignes_constructeur,
      respect_normes_securite: this.respect_normes_securite,
      autonomie_travail: this.autonomie_travail,
      participation: this.participation,
      initiative: this.initiative,
      esprit_groupe: this.esprit_groupe,
      observation: this.observation
    };
  }
}

module.exports = AvisFormateur;