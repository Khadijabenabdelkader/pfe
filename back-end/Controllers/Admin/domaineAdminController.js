const db = require('../../connect');  

const getDomains = (req, res) => {
    const sql = 'SELECT DISTINCT domaine FROM formation;'

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erreur de récupération des données:', err);
            return res.status(500).send('Erreur de récupération des données');  // Renvoi d'un message d'erreur en texte brut
        }

        if (results.length > 0) {
            const data = results.map(row => row.domaine).join('\n');  
            res.type('text/plain').send(data); 
        } else {
            res.type('text/plain').send('Aucune donnée disponible !');  
        }
    });
};


const getThemesByDomaine = (req, res) => {
    const domaine = req.query.domaine;
  
    if (!domaine) {
      return res.status(400).send('Paramètre "domaine" manquant');
    }
  
    const query = 'SELECT theme FROM session WHERE id_formation = ?';
  
    pool.execute(query, [domaine], (err, results) => {
      if (err) {
        console.error('Erreur de connexion à la base de données :', err);
        return res.status(500).send('Erreur de connexion à la base de données');
      }
  
      if (results.length > 0) {
        const themeNames = results.map(row => row.theme);
        res.send(themeNames.join(', '));
      } else {
        res.send('Aucun thème trouvé pour ce domaine.');
      }
    });
  };
  
  module.exports = {
    getThemesByDomaine
  };
  


module.exports = {
    getDomains,


};

