const db = require('../../connect');  

const getCalendrier= (req, res) => {
    /*const sql = `
    SELECT 
    c.id, 
    f.nom_complet AS formateur, 
    s.theme, 
    s.code, 
    c.nbj, 
    c.mois, 
    c.date_debut, 
    c.date_fin,
    fo.domaine
FROM calendrierformation c
JOIN session s ON c.id_session = s.id_session
JOIN formateur f ON s.id_formateur = f.id_formateur
JOIN formation fo ON s.id_formation = fo.id_formation;
`;*/
const sql = `SELECT 
  c.id, 
  f.nom_complet AS formateur, 
  s.theme, 
  s.code, 
  c.nbj, 
  c.mois, 
  c.date_debut, 
  c.date_fin,
  fo.domaine
FROM calendrierformation c
LEFT JOIN session s ON c.id_session = s.id_session
LEFT JOIN formateur f ON s.id_formateur = f.id_formateur
LEFT JOIN formation fo ON s.id_formation = fo.id_formation
WHERE s.theme IS NOT NULL
  AND fo.domaine IS NOT NULL;
`;

db.query(sql, (err, result) => {
    if (err) {
        console.error(err);
        return res.status(500).json({ error: "Erreur serveur" });
    }
    res.json(result);
});
};
const getDetailCalendrier = (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "ID de session manquant" });
    }

    /*const query = `
        SELECT 
            s.theme, 
            s.type_session, 
            s.lieu, 
            f.nom_complet,
            fp.chemin AS fiche_prg_chemin
        FROM calendrierformation c
        JOIN session s ON c.id_session = s.id_session
        JOIN formateur f ON s.id_formateur = f.id_formateur
        LEFT JOIN fiche_prg fp ON s.id_fiche_prg = fp.id_fichePrg
        WHERE c.id = ?
    `;*/
    const query = `SELECT 
    s.theme, 
    s.type_session, 
    s.lieu, 
    f.nom_complet,
    fp.chemin AS fiche_prg_chemin
FROM calendrierformation c
LEFT JOIN session s ON c.id_session = s.id_session
LEFT JOIN formateur f ON s.id_formateur = f.id_formateur
LEFT JOIN fiche_prg fp ON s.id_fiche_prg = fp.id_fichePrg
WHERE c.id = ?;
`;
    
    db.query(query, [id], (error, results) => {
        if (error) {
            console.error("Erreur lors de la récupération des détails de la session:", error);
            return res.status(500).json({ message: "Erreur serveur" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Session non trouvée" });
        }

        // Renvoie les détails de la session avec le chemin de la fiche programme
        res.json(results[0]);
    });
};

module.exports = {
    getCalendrier,
    getDetailCalendrier
}