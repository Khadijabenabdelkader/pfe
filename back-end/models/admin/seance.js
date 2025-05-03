class Seance {
    constructor({
      id_seance,
      heure_debut,
      heure_fin,
      pause_debut,
      pause_fin,
      id_session,
    }) {
      this.id_seance = id_seance;
      this.heure_debut = heure_debut;
      this.heure_fin = heure_fin;
      this.pause_debut = pause_debut;
      this.pause_fin = pause_fin;
      this.id_session = id_session;
          }
  }
  
  module.exports = Seance;