const catalogueRepository = require('../../repositories/admin/catalogueRepository');

class CatalogueService {
  async getCatalogue() {
    const rawData = await catalogueRepository.getFullCatalogue();
    
    // Transformez les données comme dans votre code original
    const formationsMap = new Map();
    rawData.forEach(row => {
        if (!formationsMap.has(row.id_formation)) {
          formationsMap.set(row.id_formation, {
            id_formation: row.id_formation,
            domaine: row.domaine,
            sessions: []
          });
        }
  
        const formation = formationsMap.get(row.id_formation);
        let session = formation.sessions.find(s => s.id_session === row.id_session);
  
        if (row.id_session && !session) {
          session = {
            id_session: row.id_session,
            theme: row.theme,
            code: row.code,
            fiche_prg: row.fiche_prg,
            cours: row.cours,
            formateurs: []
          };
          formation.sessions.push(session);
        }
  
        if (row.id_formateur && session) {
          try {
            const themesFormateur = row.themes_a_enseigner 
              ? JSON.parse(row.themes_a_enseigner)
              : {};
            
            if (themesFormateur[row.theme]) {
              const formateur = {
                id_formateur: row.id_formateur,
                nom_complet: row.nom_complet,
                mail: row.mail,
                adr: row.adr,
                domaine_de_competences: row.domaine_de_competences,
                themes_a_enseigner: themesFormateur,
                tarif_journalier: row.tarif_journalier,
                tel: row.tel,
                cv: row.cv,
                niveau_etude: row.niveau_etude,
                nb_experience: row.nb_experience,
                rang: themesFormateur[row.theme]
              };
  
              const formateurExists = session.formateurs.some(
                f => f.id_formateur === row.id_formateur
              );
              
              if (!formateurExists) {
                session.formateurs.push(formateur);
                session.formateurs.sort((a, b) => a.rang - b.rang);
              }
            }
          } catch (e) {
            console.error("Error parsing themes_a_enseigner:", e);
          }
        }
      });    
    return Array.from(formationsMap.values());
  }

  async getFormateursBySession(id_session) {
    const data = await catalogueRepository.getFormateursBySession(id_session);
    if (!data) throw new Error('Session non trouvée');
    
    return {
      id_session: parseInt(id_session),
      theme: data.session.theme,
      formateurs: data.formateurs.map(f => ({
        id_formateur: f.id_formateur,
        nom_complet: f.nom_complet,
        rang: f.themes_a_enseigner[data.session.theme] || 1
      }))
    };
  }

  async updateDomain(id_formation, updateData) {
    return catalogueRepository.updateDomain(
      id_formation, 
      updateData.formation, 
      updateData.sessions
    );
  }

  async addThemeToDomain(domaineName, themesData) {
    return catalogueRepository.addThemeToDomain(domaineName, themesData.themes,themesData.code);
  }
}

module.exports = new CatalogueService();