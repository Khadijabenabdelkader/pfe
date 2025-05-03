class Avis {
  constructor(data) {
    this.id_avis = data.id_avis;
    this.id_session = data.id_session;
    this.id_participant = data.id_participant;
    this.commentaire = data.commentaire;
    this.note = data.note;
    this.date_creation = data.date_creation;
    this.adaptation_programme_vie_pro = data.adaptation_programme_vie_pro;
    this.moyens_pedagogiques_utilises = data.moyens_pedagogiques_utilises;
    this.convenance_horaires_formation = data.convenance_horaires_formation;
    this.apports_niveau_professionnel = data.apports_niveau_professionnel;
    this.qualite_documentation_distribuee = data.qualite_documentation_distribuee;
    this.maitrise_globale_sujets_presentes = data.maitrise_globale_sujets_presentes;
    this.traitement_exemples_travail = data.traitement_exemples_travail;
    this.animations_seances = data.animations_seances;
    this.homogeneite_groupe = data.homogeneite_groupe;
    this.satisfaction_attentes = data.satisfaction_attentes;
    this.duree_formation = data.duree_formation;
  }
}

module.exports = Avis;