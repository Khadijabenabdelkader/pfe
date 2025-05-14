const db = require('../../connect');
const Session = require('../../models/admin/session');

class CalendrierUserRepository {
    async getCalendrier() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    s.id_session AS id,
                    f.nom_complet AS formateur,
                    t.theme AS theme,
                    t.code,
                    d.domaine AS domaine,
                    DATEDIFF(s.date_fin, s.date_debut) + 1 AS nbj,
                    DATE_FORMAT(s.date_debut, '%M') AS mois,
                    s.date_debut,
                    s.date_fin,
                    s.fiche_prg,
                    s.lieu,
                    s.type_session,
                    s.etat,
                    s.id_formation,
                    s.id_formateur,
                    s.id_theme
                FROM session s
                JOIN formateur f ON s.id_formateur = f.id_formateur
                JOIN formations fo ON s.id_formation = fo.id_formation
                JOIN domaine d ON fo.id_domaine = d.id_domaine
                JOIN theme t ON s.id_theme = t.id_theme
                WHERE s.date_debut IS NOT NULL
                AND s.date_fin IS NOT NULL
                ORDER BY s.date_debut
            `;
    
            db.query(query, (error, results, fields) => {
                if (error) {
                    console.error("Database Error - getCalendrier:", error);
                    return reject(new Error("Erreur de base de données"));
                }
    
                try {
                    if (!results || results.length === 0) {
                        return resolve([]);
                    }
    
                    const sessions = results.map(row => ({
                        id_session: row.id,
                        date_debut: row.date_debut,
                        date_fin: row.date_fin,
                        lieu: row.lieu ,
                        id_formation: row.id_formation,
                        id_formateur: row.id_formateur,
                        id_theme: row.id_theme,
                        type_session: row.type_session ,
                        etat: row.etat ,
                        // Ajout des champs manquants
                        theme: row.theme ,
                        domaine: row.domaine ,
                        code: row.code || '',
                        nom_complet: row.formateur,
                        fiche_prg: row.fiche_prg ,

                    }));
    
                    resolve(sessions);
                } catch (err) {
                    console.error("Transformation Error:", err);
                    reject(new Error("Erreur de transformation"));
                }
            });
        });
    }
    async getDetailCalendrier(id) {
        return new Promise((resolve, reject) => {
            if (!id) {
                return reject(new Error('ID de session manquant'));
            }
    
            const query = `
                SELECT 
                    s.*,
                    t.theme,
                    t.code,
                    f.nom_complet,
                    d.domaine AS domaine
                FROM session s
                JOIN formateur f ON s.id_formateur = f.id_formateur
                JOIN formations fo ON s.id_formation = fo.id_formation
                JOIN domaine d ON fo.id_domaine = d.id_domaine
                JOIN theme t ON s.id_theme = t.id_theme
                WHERE s.id_session = ?
            `;
    
            db.query(query, [id], (error, results, fields) => {
                if (error) {
                    console.error("Database Error - getDetailCalendrier:", {
                        message: error.message,
                        stack: error.stack,
                        sql: error.sql || "Non disponible"
                    });
                    return reject(new Error("Erreur de base de données"));
                }
    
                try {
                    // Vérification des résultats
                    if (!results || results.length === 0) {
                        return reject(new Error('Session non trouvée'));
                    }
    
                    const row = results[0];
    
                    // Validation des champs obligatoires
                    if (!row.date_debut || !row.date_fin) {
                        console.error("Données de session incomplètes:", {
                            id_session: row.id_session,
                            has_date_debut: !!row.date_debut,
                            has_date_fin: !!row.date_fin
                        });
                        return reject(new Error('Données de session incomplètes'));
                    }
    
                    // Construction de l'objet Session avec valeurs par défaut
                    const sessionData = {
                        id_session: row.id_session,
                        date_debut: row.date_debut,
                        date_fin: row.date_fin,
                        lieu: row.lieu || 'Non spécifié',
                        id_formation: row.id_formation,
                        id_formateur: row.id_formateur,
                        formateur: row.formateur,
                        id_theme: row.id_theme,
                        theme: row.theme,
                        fiche_prg: row.fiche_prg || null,
                        type_session: row.type_session || 'Standard',
                        etat: row.etat || 'Planifiée',
                        // Informations complémentaires
                        _theme: row.theme || 'Thème non spécifié',
                        _code: row.code || 'N/A',
                        _formateur: row.nom_complet || 'Formateur inconnu',
                        _domaine: row.domaine || 'Domaine non spécifié'
                    };
    
                    resolve(new Session(sessionData));
                } catch (transformError) {
                    console.error("Transformation Error - getDetailCalendrier:", {
                        message: transformError.message,
                        stack: transformError.stack,
                        rowData: results ? results[0] : null
                    });
                    reject(new Error("Erreur de traitement des données"));
                }
            });
        });
    }
}

module.exports = CalendrierUserRepository;