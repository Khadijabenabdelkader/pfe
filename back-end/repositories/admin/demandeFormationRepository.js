const db = require('../../connect');
const Participant = require('../../models/admin/participant');
class DemandeFormationRepository {
  async getAll() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM demande_de_formation_personnalise', (err, results) => {
        if (err) {
          console.error('Erreur DB:', err);
          return reject(err);
        }
        resolve(results);
      });
    });
  }
 async getAllWithParticipants() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          df.*,
          p.id_participant,
          p.nom_complet,
          p.mail,
          p.telephone,
          p.adresse,
          p.id_entreprise,
          e.nom_entreprise
        FROM demande_de_formation_personnalise df
        LEFT JOIN participants p ON df.id_participant = p.id_participant
        LEFT JOIN entreprise e ON p.id_entreprise = e.id_entreprise
        ORDER BY df.created_at DESC
      `;

      db.query(query, (err, results) => {
        if (err) {
          console.error('Erreur DB:', err);
          return reject(err);
        }
        
        // Structuration des données
        const formattedResults = results.map(row => ({
          id: row.id,
          formateur: row.formateur,
          niveau: row.niveau,
          domaine: row.domaine,
          theme: row.theme,
          nombreParticipants: row.nombre_participants,
          details: row.details,
          mode: row.mode,
          id_participant: row.id_participant,
          participant: row.id_participant ? {
            id_participant: row.id_participant,
            nom_complet: row.nom_complet,
            mail: row.mail,
            telephone: row.telephone,
            adresse: row.adresse,
            entreprise: {
              id_entreprise: row.id_entreprise,
              nom_entreprise: row.nom_entreprise
            }
          } : null
        }));

        resolve(formattedResults);
      });
    });
  }
}

// Exportez bien une instance
module.exports = new DemandeFormationRepository();