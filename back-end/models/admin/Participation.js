class Participation {
    constructor(row) {
        this.id_session = row.id_session;
        this.theme_nom = row.theme_nom; // nom du thème
        this.formateur_nom = row.formateur_nom;
        this.lieu = row.lieu;
        this.date_debut = row.date_debut;
        this.date_fin = row.date_fin;
        this.duree = row.duree;

        // Feuille de présence administrative
        this.id_presence = row.id_presence;
        this.credit_impot = row.credit_impot;
        this.droit_tirage = row.droit_tirage;
        this.mode_formation = row.mode_formation;
        this.co_organisateurs = row.co_organisateurs;
        this.entreprise_beneficiaire = row.entreprise_beneficiaire;

        // Participant
        this.id_participant = row.id_participant;
        this.nom_participant = row.nom_complet; // optionnel si jointure avec table participant
        this.emargements = row.emargements;
    }
}

module.exports = Participation;
