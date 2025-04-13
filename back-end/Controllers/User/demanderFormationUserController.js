const db = require('../../connect');

// Route pour insérer les données dans la base de données
const DemanderFormation = async(req, res) => {
  
  const { domaine, theme, formateur, niveau, nombreParticipants, quiDemande, contactMail, contactTel, matricule } = req.body;

  if (!domaine || !theme || !contactMail || !contactTel) {
    return res.status(400).json({ message: 'Les champs obligatoires sont manquants.' });
  }
  const query = `INSERT INTO demande_de_formation_personnalisee (domaine, theme, formateur, niveau, nombreParticipants, quiDemande, contactMail, contactTel, matricule) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(query, [domaine, theme, formateur, niveau, nombreParticipants, quiDemande, contactMail, contactTel, matricule], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'insertion dans la base de données: ', err);
      return res.status(500).json({ message: 'Erreur du serveur lors de l\'insertion.' });
    }
    return res.status(200).json({ message: 'Demande de formation enregistrée avec succès.' });
  });
};

module.exports = {
  DemanderFormation
};