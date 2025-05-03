const db = require('../../connect');
const Participant = require('../../models/admin/participant')
class ProfilParticipantUserRepository {
    
    async getParticipantProfile(id_participant) {
        return new Promise((resolve, reject) => {
            const query = 
            `
            SELECT p.id_participant AS id_participant,
    p.nom_complet AS nom_complet,
    p.mail AS mail,
    p.telephone AS telephone,
    p.adresse AS adresse, 
    p.CIN AS CIN,
    p.id_entreprise AS id_entreprise,
    e.nom_entreprise AS nom_entreprise,
    e.tel_entreprise AS tel_entreprise,
    e.email_entreprise AS email_entreprise,
    e.adr_entreprise AS adr_entreprise,
    e.matricule AS matricule
FROM participants p 
LEFT JOIN entreprise e ON p.id_entreprise = e.id_entreprise 
WHERE p.id_participant = ?`;
            
            db.query(query, [id_participant], (error, results) => {
                if (error) {
                    console.error('Database query error:', error);
                    return reject(new Error('Database operation failed'));
                }
                
                if (!results || results.length === 0) {
                    console.log('No participant found for ID:', id_participant);
                    return resolve(new Participant({})); // Retourne un formateur vide
                }
                
                resolve(new Participant(results[0]));
            });
        });
    }
    async updateParticipantProfile(id_participant, updateData) {
        try {
            await db.query('START TRANSACTION');

            // Vérification des données obligatoires
            if (!updateData.nom_complet || !updateData.mail) {
                throw new Error('Données obligatoires manquantes');
            }

            // Mettre à jour le participant
            const updateParticipantQuery = `
                UPDATE participants SET 
                    nom_complet = ?, mail = ?, telephone = ?, 
                    adresse = ?, CIN = ?, id_entreprise = ?, 
                WHERE id_participant = ?;
            `;
            
            const participantResult = await db.query(updateParticipantQuery, [
                updateData.nom_complet,
                updateData.mail,
                updateData.telephone || null,
                updateData.adresse || null,
                updateData.CIN || null,
                updateData.id_entreprise || null,
                participantId
            ]);

            if (participantResult.affectedRows === 0) {
                throw new Error('Participant non trouvé');
            }

            // Mettre à jour l'entreprise si elle existe
            if (updateData.id_entreprise) {
                const updateEntrepriseQuery = `
                    UPDATE entreprise SET
                        nom_entreprise = ?, tel_entreprise = ?,
                        email_entreprise = ?, adr_entreprise = ?, matricule = ?
                    WHERE id_entreprise = ?;
                `;
                
                await db.query(updateEntrepriseQuery, [
                    updateData.nom_entreprise || '',
                    updateData.tel_entreprise || '',
                    updateData.email_entreprise || '',
                    updateData.adr_entreprise || '',
                    updateData.matricule || '',
                    updateData.id_entreprise
                ]);
            }

            await db.query('COMMIT');
            return { success: true, message: "Profil mis à jour avec succès" };
        } catch (err) {
            await db.query('ROLLBACK');
            console.error("Repository Error - updateParticipantProfile:", {
                message: err.message,
                stack: err.stack,
                participantId: id_participant,
                updateData: updateData
            });
            throw err;
        }
    }
    async updateParticipantProfile(id_participant, updateData) {
        return new Promise((resolve, reject) => {
            // Validation des données obligatoires
            if (!updateData.nom_complet || !updateData.mail) {
                return reject(new Error('Données obligatoires manquantes: nom_complet et mail sont requis'));
            }
    
            // Démarrer une transaction
            db.beginTransaction((beginError) => {
                if (beginError) {
                    return reject(new Error('Échec du démarrage de la transaction'));
                }
    
                // 1. Traitement de l'entreprise si les données sont fournies
                if (updateData.entreprise) {
                    this.handleEntrepriseUpdate(updateData, (entrepriseError, entrepriseId) => {
                        if (entrepriseError) {
                            return db.rollback(() => {
                                reject(entrepriseError);
                            });
                        }
    
                        // 2. Mise à jour du participant avec le nouvel id_entreprise
                        this.updateParticipant(id_participant, updateData, entrepriseId, (participantError, participantResults) => {
                            if (participantError) {
                                return db.rollback(() => {
                                    reject(participantError);
                                });
                            }
    
                            // Tout s'est bien passé, on commit
                            db.commit((commitError) => {
                                if (commitError) {
                                    return db.rollback(() => {
                                        reject(new Error('Échec de la validation des modifications'));
                                    });
                                }
    
                                resolve({
                                    success: true,
                                    message: entrepriseId ? 
                                        'Profil participant et entreprise mis à jour avec succès' : 
                                        'Profil participant mis à jour avec succès',
                                    participant: participantResults,
                                    entrepriseId: entrepriseId || null
                                });
                            });
                        });
                    });
                } else {
                    // Pas de données entreprise, juste mettre à jour le participant
                    this.updateParticipant(id_participant, updateData, null, (participantError, participantResults) => {
                        if (participantError) {
                            return db.rollback(() => {
                                reject(participantError);
                            });
                        }
    
                        db.commit((commitError) => {
                            if (commitError) {
                                return db.rollback(() => {
                                    reject(new Error('Échec de la validation des modifications'));
                                });
                            }
    
                            resolve({
                                success: true,
                                message: 'Profil participant mis à jour avec succès',
                                participant: participantResults
                            });
                        });
                    });
                }
            });
        });
    }
    
    // Méthode pour gérer la mise à jour/création de l'entreprise
    handleEntrepriseUpdate(updateData, callback) {
        // Vérifier si le matricule existe déjà
        const checkQuery = 'SELECT id_entreprise FROM entreprise WHERE matricule = ?';
        db.query(checkQuery, [updateData.entreprise.matricule], (checkError, checkResults) => {
            if (checkError) {
                return callback(new Error('Erreur lors de la vérification de l\'entreprise'));
            }
    
            let entrepriseId = null;
    
            if (checkResults && checkResults.length > 0) {
                // Entreprise existe, on la met à jour
                entrepriseId = checkResults[0].id_entreprise;
                const updateQuery = `
                    UPDATE entreprise SET
                        nom_entreprise = ?,
                        tel_entreprise = ?,
                        email_entreprise = ?,
                        adr_entreprise = ?
                    WHERE id_entreprise = ?
                `;
    
                db.query(updateQuery, [
                    updateData.entreprise.nom_entreprise,
                    updateData.entreprise.tel_entreprise,
                    updateData.entreprise.email_entreprise,
                    updateData.entreprise.adr_entreprise,
                    entrepriseId
                ], (updateError) => {
                    if (updateError) {
                        return callback(new Error('Erreur lors de la mise à jour de l\'entreprise'));
                    }
                    callback(null, entrepriseId);
                });
            } else {
                // Entreprise n'existe pas, on la crée
                const insertQuery = `
                    INSERT INTO entreprise (
                        nom_entreprise,
                        tel_entreprise,
                        email_entreprise,
                        adr_entreprise,
                        matricule
                    ) VALUES (?, ?, ?, ?, ?)
                `;
    
                db.query(insertQuery, [
                    updateData.entreprise.nom_entreprise,
                    updateData.entreprise.tel_entreprise,
                    updateData.entreprise.email_entreprise,
                    updateData.entreprise.adr_entreprise,
                    updateData.entreprise.matricule
                ], (insertError, insertResults) => {
                    if (insertError) {
                        return callback(new Error('Erreur lors de la création de l\'entreprise'));
                    }
                    callback(null, insertResults.insertId);
                });
            }
        });
    }
    
    // Méthode pour mettre à jour le participant
    updateParticipant(id_participant, updateData, entrepriseId, callback) {
        const query = `
            UPDATE participants SET 
                nom_complet = ?, 
                mail = ?, 
                telephone = ?, 
                adresse = ?, 
                CIN = ?, 
                id_entreprise = ?
            WHERE id_participant = ?
        `;
    
        db.query(query, [
            updateData.nom_complet,
            updateData.mail,
            updateData.telephone || null,
            updateData.adresse || null,
            updateData.CIN || null,
            entrepriseId,
            id_participant
        ], (error, results) => {
            if (error) {
                return callback(new Error('Erreur lors de la mise à jour du participant'));
            }
            callback(null, results);
        });
    }
    
}

module.exports = ProfilParticipantUserRepository;