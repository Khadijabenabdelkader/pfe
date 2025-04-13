const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require('../../connect');
require("dotenv").config();

// Fonction pour créer un token JWT
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, nom_complet: user.nom_complet },
        process.env.SECRET_KEY,
        { expiresIn: "1h" }
    );
};

// Fonction utilitaire pour exécuter des requêtes MySQL avec Promesses
const queryAsync = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};

// ✅ Enregistrement d'un utilisateur avec hachage du mot de passe
const register = async (req, res) => {
    const { nom_complet, mail, pwd } = req.body;

    try {
        // 1. Vérifier si l'email existe déjà
        const checkEmailSql = "SELECT * FROM participant WHERE mail = ?";
        
        db.query(checkEmailSql, [mail], async (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Erreur serveur lors de la vérification de l'email" });
            }

            // 2. Si l'email existe déjà, retourner une erreur
            if (results.length > 0) {
                return res.status(400).json({ message: "Cet email est déjà utilisé" });
            }

            // 3. Si l'email n'existe pas, procéder à l'inscription
            try {
                // Hachage du mot de passe
                const hashedPwd = await bcrypt.hash(pwd.trim(), 10);
                const insertSql = "INSERT INTO participant (nom_complet, mail, pwd) VALUES (?, ?, ?)";

                db.query(insertSql, [nom_complet, mail, hashedPwd], (err, result) => {
                    if (err) {
                        return res.status(500).json({ message: "Erreur serveur lors de l'inscription" });
                    }

                    res.status(201).json({ message: "Utilisateur inscrit avec succès" });
                });
            } catch (hashError) {
                res.status(500).json({ message: "Erreur lors du hachage du mot de passe" });
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};
// ✅ Connexion avec vérification du mot de passe et JWT sécurisé
const login = async (req, res) => {
    const { nom_complet, pwd } = req.body;
    if (!nom_complet || !pwd) {
        return res.status(400).json({ message: "Champs manquants" });
    }

    try {
        // Vérification dans la table des formateurs d'abord
        let query = "SELECT * FROM formateur WHERE nom_complet = ?";
        db.query(query, [nom_complet], async (err, results) => {
            if (err) {
                console.error("Erreur SQL:", err);
                return res.status(500).json({ message: "Erreur serveur" });
            }

            if (results.length > 0) {
                const formateur = results[0];

                // Vérification si le mot de passe existe avant la comparaison
                if (!formateur.mdp_formateur) {
                    return res.status(400).json({ message: "Mot de passe non trouvé dans la base de données pour ce formateur" });
                }

                const isMatch = await bcrypt.compare(pwd, formateur.mdp_formateur);

                if (!isMatch) {
                    return res.status(401).json({ message: "Mot de passe incorrect" });
                }

                const token = generateToken(formateur);
return res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "Strict" })
          .status(200)
          .json({ 
              message: "Connexion réussie", 
              token, 
              isFormateur: true, 
              id_formateur: formateur.id_formateur,
              nom_complet: formateur.nom_complet, 
              telephone: formateur.telephone,

          });
     }

            // Si l'utilisateur n'est pas un formateur, vérifiez dans la table des participants
            query = "SELECT * FROM participant WHERE nom_complet = ?";
            db.query(query, [nom_complet], async (err, results) => {
                if (err) {
                    console.error("Erreur SQL:", err);
                    return res.status(500).json({ message: "Erreur serveur" });
                }

                if (results.length === 0) {
                    return res.status(401).json({ message: "Nom d'utilisateur incorrect" });
                }

                const participant = results[0];

                // Vérification si le mot de passe existe avant la comparaison
                if (!participant.pwd) {
                    return res.status(400).json({ message: "Mot de passe non trouvé dans la base de données pour ce participant" });
                }

                const isMatch = await bcrypt.compare(pwd, participant.pwd);

                if (!isMatch) {
                    return res.status(401).json({ message: "Mot de passe incorrect" });
                }

                const token = generateToken(participant);
return res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "Strict" })
          .status(200)
          .json({ 
              message: "Connexion réussie", 
              token, 
              isFormateur: false, 
              id_participant: participant.id_participant ,
              nom_complet: participant.nom_complet,
              mail: participant.mail,
              telephone: participant.telephone,
              adresse: participant.adresse || '',
              nature_participant: participant.nature_participant || 'personne',
              matricule: participant.matricule || '',
              nom_entreprise: participant.nom_entreprise || '', 
              tel_entreprise: participant.tel_entreprise || '',
              email_entreprise: participant.email_entreprise || '',
              adr_entreprise: participant.adr_entreprise || '',
           
          });
      });
        });
    } catch (error) {
        console.error("Erreur serveur lors de la connexion:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};


// ✅ Middleware pour protéger les routes avec JWT
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(403).json({ message: "Accès non autorisé" });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(401).json({ message: "Token invalide ou expiré" });
        }
        req.user = user;
        next();
    });
};



// ✅ Déconnexion en supprimant le cookie JWT
const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "Strict",
    });
    res.json({ message: "Déconnexion réussie" });
};

module.exports = { register, login, verifyToken, logout };
