const db = require('../../connect');

const getClientsPersonnes = () => {
  const query = `
    SELECT p.*, f.id_session, t.theme, t.code
FROM participants p
LEFT JOIN feuille_presence_participants f 
  ON p.id_participant = f.id_participant
LEFT JOIN session s 
  ON f.id_session = s.id_session
LEFT JOIN theme t 
  ON t.id_theme = s.id_theme
WHERE p.id_entreprise IS NULL;
;
  `;
  return new Promise((resolve, reject) => {
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const getClientsEntreprises = () => {
  const query = `
    SELECT p.*, f.id_session, t.theme, t.code, e.*
FROM participants p
JOIN feuille_presence_participants f 
  ON p.id_participant = f.id_participant
JOIN session s 
  ON f.id_session = s.id_session
LEFT JOIN theme t 
  ON t.id_theme = s.id_theme
JOIN entreprise e 
  ON e.id_entreprise = p.id_entreprise
WHERE p.id_entreprise IS NOT NULL
LIMIT 0, 25;
;
  `;
  return new Promise((resolve, reject) => {
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const getParticipantsByEntreprise = (entrepriseName) => {
  const query = `
    SELECT p.*, f.id_session, t.theme, t.code, e.*
FROM participants p
JOIN feuille_presence_participants f 
  ON p.id_participant = f.id_participant
JOIN session s 
  ON f.id_session = s.id_session
LEFT JOIN theme t 
  ON t.id_theme = s.id_theme
JOIN entreprise e 
  ON e.id_entreprise = p.id_entreprise
WHERE e.nom_entreprise = ?
GROUP BY p.nom_complet, p.telephone, p.mail, p.adresse
LIMIT 0, 25;
  `;
  return new Promise((resolve, reject) => {
    db.query(query, [entrepriseName], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};
const updateBadgeParticipant = (id_participant, badge) => {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE participants SET badge = ? WHERE id_participant = ?';
      db.query(query, [badge, id_participant], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  };

module.exports = {
  getClientsPersonnes,
  getClientsEntreprises,
  getParticipantsByEntreprise,
  updateBadgeParticipant
};