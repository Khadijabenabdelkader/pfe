const db = require('../../connect');
const AvisFormateur = require('../../models/admin/avis_f')
class AvisFormateurRepository {

  async getBySession(idSession) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
	f.nom_complet as nom_formateur,
    p.nom_complet,
    af.id_presence,
    afd.connaissances_professionnelles,
    afd.connaissances_equipements,
    afd.comprehension_competences,
    afd.aptitude_appliquer_infos,
    afd.rapidite_execution,
    afd.qualite_travaux,
    afd.clarte_pertinence_resultats,
    afd.perfectionnement_connaissances,
    afd.respect_consignes_constructeur,
    afd.respect_normes_securite,
    afd.autonomie_travail,
    afd.participation,
    afd.initiative,
    afd.esprit_groupe,
    afd.observation
FROM avis_formateur_details afd
JOIN avis_formateur af ON afd.id_avis = af.id_avis
JOIN feuille_presence fp ON fp.id_presence = af.id_presence
join feuille_presence_participants fpp on fpp.id_presence = fp.id_presence
JOIN participants p ON p.id_participant = afd.id_participant
JOIN formateur f ON f.id_formateur = af.id_formateur
WHERE fpp.id_session = ?
ORDER BY af.id_presence, afd.id_participant`;
      
      db.query(sql, [idSession], (err, results) => {
        if (err) return reject(err);
        
        // Transformation des résultats en objets AvisFormateur
        const avisList = results.map(row => new AvisFormateur(row));
        resolve(avisList);
      });
    });
  }

 
}

module.exports = new AvisFormateurRepository();