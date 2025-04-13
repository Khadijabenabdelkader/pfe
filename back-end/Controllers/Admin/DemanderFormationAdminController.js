// Importation des modules
const db = require('../../connect');

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

module.exports= {DemanderFormation};