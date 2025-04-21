const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require('../../connect');
require("dotenv").config();
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Fonction pour créer un token JWT
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, nom_complet: user.nom_complet },
        process.env.SECRET_KEY,
        { expiresIn: "1h" }
    );
};
/*
// Fonction utilitaire pour exécuter des requêtes MySQL avec Promesses
const queryAsync = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};
*/
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
/*
const changePassword = async (req, res) => {
    const { nom_complet, mail, newPassword, confirmPassword } = req.body;

    if (!nom_complet || !mail || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Les nouveaux mots de passe ne correspondent pas." });
    }

    try {
        // Vérification si c'est un formateur
        let query = "SELECT * FROM formateur WHERE nom_complet = ? AND mail = ?";
        db.query(query, [nom_complet, mail], async (err, results) => {
            if (err) {
                console.error("Erreur SQL:", err);
                return res.status(500).json({ message: "Erreur serveur" });
            }

            if (results.length > 0) {
                return res.status(403).json({ message: "Les formateurs doivent modifier leur mot de passe via l'interface admin." });
            }

            // Pour les participants
            query = "SELECT * FROM participant WHERE nom_complet = ? AND mail = ?";
            db.query(query, [nom_complet, mail], async (err, results) => {
                if (err) {
                    console.error("Erreur SQL:", err);
                    return res.status(500).json({ message: "Erreur serveur" });
                }

                if (results.length === 0) {
                    return res.status(404).json({ message: "Utilisateur non trouvé." });
                }

                const participant = results[0];
                const hashedPassword = await bcrypt.hash(newPassword, 10);

                const updateQuery = "UPDATE participant SET pwd = ? WHERE id_participant = ?";
                db.query(updateQuery, [hashedPassword, participant.id_participant], (err) => {
                    if (err) {
                        console.error("Erreur mise à jour:", err);
                        return res.status(500).json({ message: "Erreur lors de la mise à jour du mot de passe." });
                    }

                    // Mise à jour réussie, générer un nouveau token
                    const updatedParticipant = {
                        ...participant,
                        pwd: undefined, // Ne pas inclure le mot de passe dans le token
                    };

                    const token = generateToken(updatedParticipant);

                    // Répondre avec nouveau cookie + infos utilisateur
                    return res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "Strict" })
                        .status(200)
                        .json({
                            message: "Mot de passe modifié avec succès.",
                            token,
                            isFormateur: false,
                            id_participant: participant.id_participant,
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
        });
    } catch (error) {
        console.error("Erreur serveur:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};
*/
  
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

const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
      host: 'smtp.gmail.com',  
      port: 587,   
      secure: false,            
      auth: {
          user: 'khadijabenabdelkader1206@gmail.com',  // Ton email (doit être une variable d'environnement)
          pass: 'qqij aava gtxv hpdz', 
      }
  });
  const sendResetEmail = async ({ to, token, expiresAt }) => {
    const resetLink = `${process.env.APP_URL}/reset-password?token=${token}&email=${to}`;
    
    const mailOptions = {
        from: `khadijabenabdelkader1206@gmail.com `,
        to,
        subject: 'Réinitialisation de votre mot de passe',
        html: `
            <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
            <p>Ce lien expirera le ${expiresAt.toLocaleString()}</p>
            <a href="${resetLink}">Cliquez ici pour réinitialiser votre mot de passe</a>
            <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
        `
    };

    return transporter.sendMail(mailOptions);
};

const requestPasswordReset = async (req, res) => {
    const { mail } = req.body;

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(mail)) {
        return res.status(400).json({ message: "Format d'email invalide" });
    }

    try {
        // 1. Vérifier si l'email existe dans participant
        const participant = await queryAsync("SELECT * FROM participant WHERE mail = ?", [mail]);

        if (!participant.length) {
            return res.status(404).json({ message: "Aucun compte trouvé avec cet email" });
        }

        // 2. Générer un token (valable 1 heure)
        const resetToken = generateResetToken();
        const expiresAt = new Date(Date.now() + 3600000); // 1 heure

        // 3. En production: Envoyer l'email avec le token
        // Exemple avec Nodemailer (à configurer):
        
        await sendResetEmail({ to: mail, token: resetToken, expiresAt });
    
        res.status(200).json({ 
            message: "Un email de réinitialisation a été envoyé",
            // En production, ne renvoyez pas le token dans la réponse
            token: process.env.NODE_ENV === 'development' ? resetToken : undefined
        });

    } catch (error) {
        console.error("Erreur demande réinitialisation:", error);
        res.status(500).json({ 
            message: "Erreur serveur",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const resetPassword = async (req, res) => {
    const { token, email, newPassword, confirmPassword } = req.body;

    try {
        // 1. Validation des données
        if (!token || !email) {
            return res.status(400).json({ message: "Token et email requis" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Les mots de passe ne correspondent pas" });
        }

        // 2. Vérification force mot de passe
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ 
                message: "Le mot de passe doit contenir 8 caractères minimum avec majuscule, minuscule, chiffre et caractère spécial" 
            });
        }

        // 3. Vérifier l'email dans la base
        const participant = await queryAsync("SELECT * FROM participant WHERE mail = ?", [email]);
        if (!participant.length) {
            return res.status(404).json({ message: "Aucun compte trouvé avec cet email" });
        }

        // 4. En production: Vérifier que le token est valide et non expiré
        // (implémentez cette logique selon votre système de stockage de tokens)

        // 5. Hacher et mettre à jour le mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await queryAsync("UPDATE participant SET pwd = ? WHERE mail = ?", [hashedPassword, email]);

        res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });

    } catch (error) {
        console.error("Erreur réinitialisation mdp:", error);
        res.status(500).json({ 
            message: "Erreur serveur",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ✅ Changement de mot de passe (pour utilisateur connecté)
const changePassword = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = req.user;

    try {
        // 1. Validation des données
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Les mots de passe ne correspondent pas" });
        }

        // 2. Vérifier la force du nouveau mot de passe
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ 
                message: "Le mot de passe doit contenir 8 caractères minimum avec au moins une majuscule, une minuscule, un chiffre et un caractère spécial" 
            });
        }

        // 3. Vérifier l'utilisateur et son mot de passe actuel
        let userInDb;
        if (user.isFormateur) {
            userInDb = await queryAsync("SELECT * FROM formateur WHERE id_formateur = ?", [user.id]);
            if (!userInDb.length) {
                return res.status(404).json({ message: "Formateur non trouvé" });
            }
            
            const isMatch = await bcrypt.compare(currentPassword, userInDb[0].mdp_formateur);
            if (!isMatch) {
                return res.status(401).json({ message: "Mot de passe actuel incorrect" });
            }

            // 4. Mettre à jour le mot de passe
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await queryAsync("UPDATE formateur SET mdp_formateur = ? WHERE id_formateur = ?", [hashedPassword, user.id]);
        } else {
            userInDb = await queryAsync("SELECT * FROM participant WHERE id_participant = ?", [user.id]);
            if (!userInDb.length) {
                return res.status(404).json({ message: "Participant non trouvé" });
            }

            const isMatch = await bcrypt.compare(currentPassword, userInDb[0].pwd);
            if (!isMatch) {
                return res.status(401).json({ message: "Mot de passe actuel incorrect" });
            }

            // 4. Mettre à jour le mot de passe
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await queryAsync("UPDATE participant SET pwd = ? WHERE id_participant = ?", [hashedPassword, user.id]);
        }

        res.status(200).json({ message: "Mot de passe changé avec succès" });

    } catch (error) {
        console.error("Erreur lors du changement de mot de passe:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
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

  
  module.exports = { 
    register, 
    login, 
    verifyToken, 
    logout,
    changePassword,
    requestPasswordReset,
    resetPassword
  };