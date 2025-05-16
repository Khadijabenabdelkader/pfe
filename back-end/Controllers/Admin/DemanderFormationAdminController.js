// Importation des modules
{/*const db = require('../../connect');

const DemanderFormation = (req, res) => {
  const query = 'SELECT * FROM demande_de_formation_personnalisee';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des données: ', err);
      return res.status(500).json({ error: 'Erreur lors de la récupération des données' });
    }
    res.json(results);
  });
};

module.exports= {DemanderFormation};*/}
const db = require('../../connect');
const demandeFormationService = require('../../services/admin/demandeFormationPersonalisee'); // Déclaration UNIQUE

class DemandeFormationController {
 async getAll(req, res) {
    try {
      const demandes = await demandeFormationService.getAllDemandesWithParticipants();
      res.json(demandes);
    } catch (error) {
      console.error('Erreur contrôleur:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des demandes',
        details: error.message 
      });
    }
  }
}

module.exports = new DemandeFormationController();