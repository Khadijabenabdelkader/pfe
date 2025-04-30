class AvisFormateur {
    constructor(data) {
      // Identifiants
      this.id_avis = data.id_avis;
      this.id_session = data.id_session;
      
      // Évaluations techniques (notes)
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
      
      // Évaluations comportementales
      this.autonomie_travail = data.autonomie_travail;
      this.participation = data.participation;
      this.assiduite_ponctualite = data.assiduite_ponctualite;
      this.initiative = data.initiative;
      this.esprit_groupe = data.esprit_groupe;
      
      // Informations supplémentaires
      this.observation = data.observation || null;
      this.nom_participant = data.nom_participant;
      this.nom_formateur = data.nom_formateur;
      this.date_creation = data.date_creation || new Date().toISOString();
      this.theme = data.theme;
    }
  
    validate() {
      // Validation des champs obligatoires
      if (!this.id_session) {
        throw new Error('ID de session est requis');
      }
  
      if (!this.nom_participant || !this.nom_formateur) {
        throw new Error('Les noms du participant et du formateur sont requis');
      }
  
      // Validation des notes (doivent être entre 1 et 5 par exemple)
      const champsNotes = [
        'connaissances_professionnelles',
        'connaissances_equipements',
        // ... ajoutez tous les autres champs de notation
      ];
  
      for (const champ of champsNotes) {
        const note = this[champ];
        if (note === undefined || note === null) {
          throw new Error(`La note pour ${champ} est requise`);
        }
        if (note < 1 || note > 5) {
          throw new Error(`La note pour ${champ} doit être entre 1 et 5`);
        }
      }
  
      // Validation de l'observation si nécessaire
      if (this.observation && this.observation.length > 500) {
        throw new Error('L\'observation ne doit pas dépasser 500 caractères');
      }
    }
  
    toJSON() {
      return {
        id_avis: this.id_avis,
        id_session: this.id_session,
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
        assiduite_ponctualite: this.assiduite_ponctualite,
        initiative: this.initiative,
        esprit_groupe: this.esprit_groupe,
        observation: this.observation,
        nom_participant: this.nom_participant,
        nom_formateur: this.nom_formateur,
        date_creation: this.date_creation,
        theme: this.theme
      };
    }
  }
  
  module.exports = AvisFormateur;