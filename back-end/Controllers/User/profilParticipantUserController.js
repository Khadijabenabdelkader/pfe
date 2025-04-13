const db = require('../../connect');  

// Récupérer les informations du participant avec ses sessions
const getParticipantProfile = (req, res) => {
    const participantId = req.params.id;

    const query = `
        SELECT 
            p.id_participant, p.nom_complet, p.mail, p.telephone, p.adresse, 
            p.matricule, p.nom_entreprise, p.tel_entreprise, p.email_entreprise, 
            p.nature_participant, 
            s.id_session, s.theme
        FROM participant p
        LEFT JOIN session s ON p.id_session = s.id_session
        WHERE p.id_participant = ?;
    `;

    db.query(query, [participantId], (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération du profil:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Participant non trouvé" });
        }

        // Regrouper les données
        const participant = {
            id_participant: results[0].id_participant,
            nom_complet: results[0].nom_complet,
            mail: results[0].mail,
            telephone: results[0].telephone,
            adresse: results[0].adresse,
            matricule: results[0].matricule,
            nom_entreprise: results[0].nom_entreprise,
            tel_entreprise: results[0].tel_entreprise,
            email_entreprise: results[0].email_entreprise,
            nature_participant: results[0].nature_participant,
            sessions: results.map(row => ({
                id_session: row.id_session,
                theme: row.theme
            }))
        };

        res.status(200).json(participant);
    });
};

// Récupérer les informations du participant et mettre à jour
const updateParticipantProfile = (req, res) => {
    const id_participant = req.params.id;
    
    const {
        nom_complet, mail, telephone, adresse,
        matricule, nom_entreprise, tel_entreprise,
        email_entreprise, adr_entreprise, nature_participant
    } = req.body;
    
    let query = `
        UPDATE participant SET 
            nom_complet = ?, mail = ?, telephone = ?, 
            adresse = ?, nature_participant = ?`;
    const params = [nom_complet, mail, telephone, adresse, nature_participant];

    if (nature_participant === 'entreprise') {
        query += `, matricule = ?, nom_entreprise = ?, tel_entreprise = ?, 
                   email_entreprise = ?, adr_entreprise = ?`;
        params.push(matricule, nom_entreprise, tel_entreprise, email_entreprise, adr_entreprise);
    }

    query += ` WHERE id_participant = ?`;
    params.push(id_participant);

    db.query(query, params, (err, results) => {
        if (err) {
            console.error("Erreur lors de la mise à jour du profil:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Participant non trouvé" });
        }

        res.status(200).json({ message: "Profil mis à jour avec succès" });
    });
};

module.exports = { getParticipantProfile, updateParticipantProfile };
