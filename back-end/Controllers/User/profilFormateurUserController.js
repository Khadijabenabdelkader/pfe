const db = require('../../connect');  
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
// Récupérer les informations du formateur
const getFormateurDetails = (req, res) => {
  const { id_formateur } = req.params;

  const query = 'SELECT * FROM formateur WHERE id_formateur = ?';
  db.query(query, [id_formateur], (err, result) => {
    if (err) {
      console.error("Error fetching formateur:", err);
      return res.status(500).json({ error: err.message });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Formateur not found' });
    }

    const formateur = result[0];

    // Requête pour obtenir les fiches programme liées à ce formateur
    const fichePrgQuery = 'SELECT id_fichePrg, chemin FROM fiche_prg WHERE id_formateur = ?';
    db.query(fichePrgQuery, [id_formateur], (err, ficheResults) => {
      if (err) {
        console.error("Error fetching fiches programme:", err);
        return res.status(500).json({ error: err.message });
      }

      // Ajouter les fiches programme au formateur
      formateur.fichePrg = ficheResults.map(fiche => ({
        ...fiche,
        fichier_pdf: fiche.fichier_pdf ? `${process.env.BASE_URL}/uploads/${fiche.fichier_pdf}` : null
      }));


      const coursSessionQuery = 'SELECT * FROM cours_session WHERE id_formateur = ?';
      db.query(coursSessionQuery, [id_formateur], (err, coursSessionResults) => {
        if (err) {
          console.error("Error fetching cours sessions:", err);
          return res.status(500).json({ error: err.message });
        }

        // Vérification des résultats de coursSession

        if (coursSessionResults.length > 0) {
          // Ajouter les sessions de cours au formateur
          formateur.coursSession = coursSessionResults;
        } else {
          console.log("Aucune session de cours trouvée pour ce formateur");
          formateur.coursSession = []; // Si aucune session n'est trouvée
        }

        return res.json(formateur);
      });
    });
  });
};

  
// Récupérer les formations à réaliser
const getFormationsARealiser = (req, res) => {
    const { id_formateur } = req.params;

    if (!id_formateur) {
        return res.status(400).json({ error: 'ID formateur est requis.' });
    }

    const query = `
        SELECT 
            s.id_session, 
            s.theme, 
            s.code, 
            f.domaine, 
            s.etat, 
            s.type_session, 
            fp.chemin AS fiche_prg  
        FROM session s
        JOIN formation f ON s.id_formation = f.id_formation
        JOIN formateur frm ON s.id_formateur = frm.id_formateur
        LEFT JOIN fiche_prg fp ON frm.id_formateur = fp.id_formateur  -- Jointure sur fiche_prg
        WHERE s.etat = 'A Realisé' 
          AND frm.id_formateur = ?;
    `;

    db.query(query, [id_formateur], (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des sessions :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Aucune formation à réaliser trouvée.' });
        }

        res.json(results);
    });
};


const getHistoriqueFormations = (req, res) => {
  const { id_formateur } = req.params;

  if (!id_formateur) {
      return res.status(400).json({ error: 'ID formateur est requis.' });
  }

  const query = `
     SELECT 
          s.id_session, 
          s.theme, 
          s.code, 
          f.domaine, 
          s.etat, 
          s.type_session, 
          fp.chemin AS fiche_prg  -- Récupère le chemin de la fiche du formateur
      FROM session s
      JOIN formation f ON s.id_formation = f.id_formation
      JOIN formateur frm ON s.id_formateur = frm.id_formateur
      LEFT JOIN fiche_prg fp ON frm.id_formateur = fp.id_formateur  -- Jointure sur fiche_prg
      WHERE s.etat = 'Déja Réalisé' 
        AND frm.id_formateur = ?;
  `;

  db.query(query, [id_formateur], (error, results) => {
      if (error) {
          console.error('Erreur lors de la récupération des formations réalisées :', error);
          return res.status(500).json({ error: 'Erreur serveur lors de la récupération des formations.' });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: 'Aucune formation historique trouvée.' });
      }

      // Pour chaque session, vérifier s'il y a des fichiers à renvoyer
      results.forEach(session => {
        // Préparer les URLs des fichiers PDF
        session.fiche_prg = session.fiche_prg ? `${process.env.BASE_URL}/uploads/${session.fiche_prg}` : null;
        session.avis_pdf = session.avis_pdf ? `${process.env.BASE_URL}/uploads/${session.avis_pdf}` : null;
      });
  
      res.status(200).json(results); // Renvoie les formations avec les liens des fichiers
    });
};


const updatePassword = (req, res) => {
    const { id_formateur } = req.params;
    const { old_password, new_password } = req.body; // Le mot de passe actuel et le nouveau mot de passe

    // Vérification que les champs sont fournis
    if (!old_password || !new_password) {
        return res.status(400).json({ error: 'Les champs mot de passe actuel et nouveau mot de passe sont requis.' });
    }

    // Requête pour récupérer le mot de passe actuel du formateur
    const query = 'SELECT mdp_formateur FROM formateur WHERE id_formateur = ?';
    
    db.query(query, [id_formateur], (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération du mot de passe :', error);
            return res.status(500).json({ error: 'Erreur serveur lors de la récupération du mot de passe.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Formateur non trouvé.' });
        }

        const storedPassword = results[0].mdp_formateur;

        // Vérification du mot de passe actuel en le comparant avec le haché stocké
        bcrypt.compare(old_password, storedPassword, (err, isMatch) => {
            if (err) {
                console.error('Erreur lors de la vérification du mot de passe :', err);
                return res.status(500).json({ error: 'Erreur serveur lors de la vérification du mot de passe.' });
            }

            if (!isMatch) {
                return res.status(400).json({ error: 'Le mot de passe actuel est incorrect.' });
            }

            // Hachage du nouveau mot de passe avant de le sauvegarder
            bcrypt.hash(new_password, 10, (hashError, hashedPassword) => {
                if (hashError) {
                    console.error('Erreur lors du hachage du mot de passe :', hashError);
                    return res.status(500).json({ error: 'Erreur serveur lors du hachage du mot de passe.' });
                }

                // Mise à jour du mot de passe avec le mot de passe haché
                const updateQuery = 'UPDATE formateur SET mdp_formateur = ? WHERE id_formateur = ?';
                
                db.query(updateQuery, [hashedPassword, id_formateur], (updateError, updateResults) => {
                    if (updateError) {
                        console.error('Erreur lors de la mise à jour du mot de passe :', updateError);
                        return res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du mot de passe.' });
                    }

                    res.status(200).json({ message: 'Mot de passe mis à jour avec succès.' });
                });
            });
        });
    });   
};
// Route pour récupérer les événements du formateur connecté
const getEvents = (req, res) => {
  const { nom_complet } = req.user; // Assure-toi que le middleware d'authentification ajoute l'utilisateur dans req.user
  console.log(nom_complet);
  db.query(
      'SELECT id, title, date, created_by FROM calendrier WHERE created_by = ?',
      [nom_complet],
      (err, results) => {
          if (err) {
              console.error('Erreur lors de la récupération des événements :', err);
              return res.status(500).json({ error: 'Erreur serveur' });
          }
          res.status(200).json(results);
      }
  );
};
const sendModificationRequest = async (req, res) => {
  try {
    const { telephone, nouveauxDonnes, nomFormateur, email } = req.body;
    
    if (!telephone || !nouveauxDonnes || !nomFormateur || !email ) {
      return res.status(400).send('Tous les champs sont requis');
    }

    // Générer un token unique pour cette demande
    const crypto = require('crypto');
    const token = crypto.randomBytes(20).toString('hex');

    // Enregistrer la demande dans la base de données (exemple simplifié)
    // Vous devriez utiliser votre modèle MongoDB ici
    // await ModificationRequest.create({ userId, token, expiration, status: 'pending' });

    // URL pour les boutons d'acceptation/rejet
    const baseUrl = process.env.back_URL || 'http://localhost:5000';
    const acceptUrl = `${baseUrl}/apiUser/modification/response?token=${token}&decision=accept&email=${email}`;
const rejectUrl = `${baseUrl}/apiUser/modification/response?token=${token}&decision=reject&email=${email}`;

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


// Préparation de l'email
const mailOptions = {
  from: email,
  to: 'khadijabenabdelkader1206@gmail.com',
      subject: `Demande de modification - ${nomFormateur}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Nouvelle demande de modification</h2>
          <p><strong>Formateur:</strong> ${nomFormateur}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Téléphone:</strong> ${telephone}</p>
          <p><strong>Nouvelles données:</strong></p>
          <p>${nouveauxDonnes}</p>
          
          <div style="margin: 20px 0;">
            <a href="${acceptUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;">
              Accepter
            </a>
            <a href="${rejectUrl}" style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Rejeter
            </a>
          </div>
          
          <p style="font-size: 0.8em; color: #666;">
            Ces liens expireront dans 1 heure.
          </p>
        </div>
      `,
      attachments: req.files?.fichiers?.map(file => ({
        filename: file.originalname,
        path: file.path
      })) || []
    };

    // Envoi de l'email
    await transporter.sendMail(mailOptions);

    // Nettoyage des fichiers après envoi
    if (req.files?.fichiers) {
      req.files.fichiers.forEach(file => {
        fs.unlinkSync(file.path);
      });
    }

    res.status(200).send('Demande envoyée avec succès');
  } catch (error) {
    console.error('Erreur:', error);
    
    // Nettoyage des fichiers en cas d'erreur
    if (req.files?.fichiers) {
      req.files.fichiers.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).send('Erreur lors du traitement de la demande');
  }
};

// Nouvelle route pour gérer les réponses
const handleModificationResponse = async (req, res) => {
  try {
    const { token, decision, email } = req.query;
    
    // Vérifier le token et récupérer la demande (exemple simplifié)
    // const request = await ModificationRequest.findOne({ token });
    
    // if (!request || request.expiration < Date.now()) {
    //   return res.status(400).send('Lien invalide ou expiré');
    // }
    
    // if (request.status !== 'pending') {
    //   return res.status(400).send('Cette demande a déjà été traitée');
    // }
    
    // Récupérer les informations de l'utilisateur (exemple simplifié)
    // const user = await User.findById(request.userId);
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',  
      port: 587,   
      secure: false,            
      auth: {
        user: 'khadijabenabdelkader1206@gmail.com',
        pass: 'qqij aava gtxv hpdz', 
      }
    });

    // Envoyer la réponse au formateur
    const responseMailOptions = {
      from: 'khadijabenabdelkader1206@gmail.com',
      to: email, // user.email dans la vraie application
      subject: `Réponse à votre demande de modification`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Votre demande de modification a été ${decision === 'accept' ? 'acceptée' : 'rejetée'}</h2>
          
          <p>Nous vous informons que votre demande de modification a été <strong>${
            decision === 'accept' ? 'acceptée' : 'rejetée'
          }</strong> par l'administrateur.</p>
          
          ${decision === 'accept' ? 
            '<p>Vos modifications seront appliquées dans les plus brefs délais.</p>' : 
            '<p>Pour plus d\'informations, vous pouvez contacter l\'administrateur.</p>'}
        </div>
      `
    };

    await transporter.sendMail(responseMailOptions);

    // Mettre à jour le statut de la demande (exemple simplifié)
    // request.status = decision === 'accept' ? 'accepted' : 'rejected';
    // await request.save();

    res.send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: ${decision === 'accept' ? 'green' : 'red'}">
            Demande ${decision === 'accept' ? 'acceptée' : 'rejetée'} avec succès
          </h1>
          <p>Une notification a été envoyée au formateur.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).send('Erreur lors du traitement de la réponse');
  }
};

/*const sendModificationRequest = async (req, res) => {
  try {
    // Vérifier si des fichiers ont été uploadés
    if (!req.files || !req.files.fichiers) {
      return res.status(400).send('Aucun fichier joint');
    }

    const { telephone, nouveauxDonnes, nomFormateur, email } = req.body;
    
    if (!telephone || !nouveauxDonnes || !nomFormateur || !email) {
      return res.status(400).send('Tous les champs sont requis');
    }

    // Configuration du transporteur email
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
    

    // Préparation de l'email
    const mailOptions = {
      from: email,
      to: 'khadijabenabdelkader1206@gmail.com',
      subject: `Demande de modification - ${nomFormateur}`,
      text: `
        Nouvelle demande de modification:
        - Formateur: ${nomFormateur}
        - Email: ${email}
        - Téléphone: ${telephone}
        - Nouvelles données: ${nouveauxDonnes}
      `,
      attachments: req.files.fichiers.map(file => ({
        filename: file.originalname,
        path: file.path
      }))
    };

    // Envoi de l'email
    await transporter.sendMail(mailOptions);

    // Nettoyage des fichiers après envoi
    req.files.fichiers.forEach(file => {
      fs.unlinkSync(file.path);
    });

    res.status(200).send('Demande envoyée avec succès');
  } catch (error) {
    console.error('Erreur:', error);
    
    // Nettoyage des fichiers en cas d'erreur
    if (req.files && req.files.fichiers) {
      req.files.fichiers.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).send('Erreur lors du traitement de la demande');
  }
};*/
  
  // Créer un nouvel événement pour un formateur
 /* const createEvent = (req, res) => {
    const { title, date, created_by } = req.body;
  
    if (!title || !date || !created_by) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    const sql = "INSERT INTO calendrier (title, date, created_by) VALUES (?, ?, ?)";
    db.query(sql, [title, date, created_by], (err, result) => {
      if (err) {
        console.error('Database Error:', err);
        return res.status(500).json({ error: 'Erreur serveur', details: err.message });
      }
      const newEvent = {
        id: result.insertId,
        title,
        date,
        created_by,
      };
      res.status(201).json(newEvent);
    });
  };
  // Supprimer un événement (seulement par son créateur)
  const deleteEvent = (req, res) => {

    const { id } = req.params;
    const createdBy = req.user.nom_complet; // Assure-toi que c'est bien le champ stocké en DB
  
    db.query('DELETE FROM calendrier WHERE id = ? AND created_by = ?', [id, createdBy], (err, results) => {
        if (err) {
        console.error('Erreur lors de la suppression de l\'événement :', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
  
      if (results.affectedRows === 0) {
        return res.status(403).json({ error: 'Vous ne pouvez supprimer que vos propres événements' });
      }
  
      res.status(200).json({ message: 'Événement supprimé avec succès' });
    });
  };
  */

module.exports = { 
    getFormateurDetails, 
    getFormationsARealiser, 
    getHistoriqueFormations,
    updatePassword,
    getEvents, //createEvent, deleteEvent
    sendModificationRequest,
    handleModificationResponse
};
