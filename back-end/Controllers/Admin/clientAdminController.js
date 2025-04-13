const db = require('../../connect');

const getClientsPersonnes = (req, res) => {
  const query = `
    SELECT 
      p.nom_complet, 
      p.telephone, 
      p.mail, 
      p.adresse, 
      s.theme 
    FROM 
      participant p
    JOIN 
      session s ON p.id_session = s.id_session
    WHERE 
      p.nature_participant = 'personne';
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des clients personnes:", err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(results);
  });
};
const getClientsEntreprises = (req, res) => {
    const query = `
      SELECT 
    p.nom_entreprise, 
    p.telephone AS telephone_entreprise, 
    p.email_entreprise, 
    p.adr_entreprise AS adresse_entreprise, 
    p.matricule,
    GROUP_CONCAT(DISTINCT s.theme SEPARATOR ', ') AS themes
FROM 
    participant p
JOIN 
    session s ON p.id_session = s.id_session
WHERE 
    p.nature_participant = 'entreprise'
GROUP BY 
    p.matricule;

    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error("Erreur lors de la récupération des clients entreprises:", err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      res.json(results);
    });
  };
  
  // Récupérer les participants pour une entreprise spécifique
  const getParticipantsByEntreprise = (req, res) => {
    const { entrepriseName } = req.params;
    const query = `
      SELECT 
    p.nom_complet, 
    p.telephone, 
    p.mail, 
    p.adresse,
    GROUP_CONCAT(DISTINCT s.theme SEPARATOR ', ') AS themes
FROM 
    participant p
JOIN 
    session s ON p.id_session = s.id_session
WHERE 
    p.nature_participant = 'entreprise' 
    AND p.nom_entreprise = ?
GROUP BY 
    p.nom_complet, p.telephone, p.mail, p.adresse;

    `;
    
    db.query(query, [entrepriseName], (err, results) => {
      if (err) {
        console.error("Erreur lors de la récupération des participants:", err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      res.json(results);
    });
  };
    

module.exports = {
  getClientsPersonnes,
  getClientsEntreprises,
  getParticipantsByEntreprise
};
