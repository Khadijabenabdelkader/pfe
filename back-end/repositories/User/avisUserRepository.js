const db = require('../../connect');
const Avis = require('../../models/admin/avis_p');

class AvisUserRepository {
    async createAvis(avisData) {
        try {
            const query = `
                INSERT INTO avis 
                (id_participant, id_session, note, commentaire, adaptation_programme_vie_pro, 
                moyens_pedagogiques_utilises, convenance_horaires_formation, apports_niveau_professionnel, 
                qualite_documentation_distribuee, maitrise_globale_sujets_presentes, traitement_exemples_travail, 
                animations_seances, homogeneite_groupe, satisfaction_attentes, duree_formation) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const result = await db.query(query, [
                avisData.id_participant,
                avisData.id_session,
                avisData.note,
                avisData.commentaire,
                avisData.adaptation_programme_vie_pro,
                avisData.moyens_pedagogiques_utilises,
                avisData.convenance_horaires_formation,
                avisData.apports_niveau_professionnel,
                avisData.qualite_documentation_distribuee,
                avisData.maitrise_globale_sujets_presentes,
                avisData.traitement_exemples_travail,
                avisData.animations_seances,
                avisData.homogeneite_groupe,
                avisData.satisfaction_attentes,
                avisData.duree_formation
            ]);

            return new Avis({
                id_avis: result.insertId,
                ...avisData,
                date_creation: new Date()
            });

        } catch (err) {
            console.error('Repository Error - createAvis:', err);
            throw err;
        }
    }

    async getSessionsByParticipant(id_participant) {
        try {
            const query = `
                SELECT s.id_session, s.theme, s.code, s.etat, s.id_formation, s.id_formateur
                FROM session s
                JOIN participant p ON FIND_IN_SET(s.id_session, p.id_session) > 0
                WHERE p.id_participant = ?;
            `;

            const results = await db.query(query, [id_participant]);
            return results;

        } catch (err) {
            console.error('Repository Error - getSessionsByParticipant:', err);
            throw err;
        }
    }
}

module.exports = AvisUserRepository;