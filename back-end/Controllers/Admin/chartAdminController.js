const db = require('../../connect');
const sessionStats = async (req, res) => {
    try {
      const query = `
        SELECT f.nom_complet AS nom_formateur, COUNT(s.id_session) AS nombre_sessions
        FROM session s
        JOIN formateur f ON s.id_formateur = f.id_formateur
        GROUP BY s.id_formateur;
      `;
      
      console.log("Exécution de la requête SQL : ", query);  // Log de la requête SQL
  
      const result = await db.query(query);  // Assurez-vous d'utiliser la méthode correcte pour votre bibliothèque DB
      console.log("Résultats récupérés des statistiques des formateurs:", result);  // Log des résultats bruts
  
      if (result && result.length > 0) {
        const rows = result[0];  // Si tu utilises mysql2, les données sont dans result[0]
        console.log("Lignes retournées:", rows);  // Vérification des lignes retournées
        res.json(rows);  // Retourne les données au frontend
      } else {
        console.log("Aucune donnée trouvée pour les statistiques des formateurs");
        res.json([]);  // Si aucune donnée n'est trouvée, renvoie un tableau vide
      }
    } catch (error) {
      console.error("Erreur dans la récupération des statistiques des formateurs :", error);
      res.status(500).json({ error: "Erreur lors de la récupération des statistiques des formateurs" });
    }
  };
  
const avisStats = async (req, res) => {
    try {
      const query = `
        SELECT DATE_FORMAT(date_creation, '%Y-%m') AS mois, COUNT(id_avis) AS nombre_avis
        FROM avis
        GROUP BY mois
        ORDER BY mois ASC;
      `;
  
      console.log("Exécution de la requête SQL : ", query);  // Log de la requête SQL
  
      const result = await db.query(query); // Assurez-vous d'utiliser la bonne méthode de requête pour votre bibliothèque DB
      console.log("Résultats récupérés des statistiques des avis:", result);  // Log des résultats bruts
  
      if (result && result.length > 0) {
        const rows = result[0];  // Si tu utilises mysql2, les données sont dans result[0]
        console.log("Lignes retournées:", rows);  // Vérification des lignes retournées
        res.json(rows);  // Retourne les données au frontend
      } else {
        console.log("Aucune donnée trouvée pour les statistiques des avis");
        res.json([]);  // Si aucune donnée n'est trouvée, renvoie un tableau vide
      }
    } catch (error) {
      console.error("Erreur dans la récupération des statistiques des avis :", error);
      res.status(500).json({ error: "Erreur lors de la récupération des statistiques des avis" });
    }
  }
  
const participantStats = async (req, res) => {
    try {
      const query = `
        SELECT nature_participant, COUNT(id_participant) AS nombre_participants
        FROM participant
        GROUP BY nature_participant;
      `;
  
      console.log("Exécution de la requête SQL : ", query);  // Log de la requête SQL
  
      const result = await db.query(query);
      console.log("Résultats récupérés des statistiques des participants:", result);  // Log des résultats bruts
  
      if (result && result.length > 0) {
        const rows = result[0];  // Vérifie si tu manipules correctement le résultat
        console.log("Lignes retournées:", rows);  // Vérification des lignes retournées
        res.json(rows);
      } else {
        console.log("Aucune donnée trouvée pour les statistiques des participants");
        res.json([]);  // Retourne un tableau vide si aucune donnée n'est trouvée
      }
    } catch (error) {
      console.error("Erreur dans la récupération des statistiques des participants :", error);
      res.status(500).json({ error: "Erreur lors de la récupération des statistiques des participants" });
    }
  }
  
  const sessionsPopulaire = async (req, res) => {
    try {
        const query = `
            SELECT s.theme, f.domaine, COUNT(p.id_participant) AS nombre_participants
            FROM participant p
            JOIN session s ON p.id_session = s.id_session
            JOIN formation f ON s.id_formation = f.id_formation
            GROUP BY s.theme, f.domaine
            ORDER BY nombre_participants DESC
            LIMIT 5;
        `;

        console.log("Exécution de la requête SQL :", query);

        const result = await db.query(query);  // Assure-toi que le premier élément est un tableau

        console.log("Données retournées :", result);  // Vérifie la structure des résultats

        if (rows.length > 0) {
            res.json(rows);
        } else {
            console.log("Aucune donnée trouvée.");
            res.json([]);
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des sessions populaires :", error);
        res.status(500).json({ error: "Erreur lors de la récupération des sessions populaires" });
    }
};


module.exports = {
    sessionStats,
    avisStats,
    participantStats,
    sessionsPopulaire
}