import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface FormateurSession {
  id_formateur: number;
  nom_complet: string;
  cv: string;
  tarif_journalier: number;
  fiche_prg: string;
  cours_session: string;
  mode: string;
  duree: string;
}

const FormateurTheme: React.FC<{ themeId: number }> = ({ themeId }) => {
  const [data, setData] = useState<FormateurSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/apiUser/formations/theme/${themeId}`
        );
        
        setData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [themeId]);

  // Grouper les sessions par formateur
  const formateursSessions = data.reduce((acc, item) => {
    const existingFormateur = acc.find(f => f.id_formateur === item.id_formateur);
    
    if (existingFormateur) {
      existingFormateur.sessions.push({
        fiche_prg: item.fiche_prg,
        cours_session: item.cours_session,
        mode: item.mode,
        duree: item.duree
      });
    } else {
      acc.push({
        id_formateur: item.id_formateur,
        nom_complet: item.nom_complet,
        cv: item.cv,
        tarif_journalier: item.tarif_journalier,
        sessions: [{
          fiche_prg: item.fiche_prg,
          cours_session: item.cours_session,
          mode: item.mode,
          duree: item.duree
        }]
      });
    }
    
    return acc;
  }, [] as Array<{
    id_formateur: number;
    nom_complet: string;
    cv: string;
    tarif_journalier: number;
    sessions: Array<{
      fiche_prg: string;
      cours_session: string;
      mode: string;
      duree: string;
    }>;
  }>);

  if (loading) return <p className="text-center py-4">Chargement des données...</p>;
  if (error) return <p className="text-center text-red-500 py-4">Erreur: {error}</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-teal-600">Formateurs et Sessions pour ce thème</h2>
      
      {formateursSessions.length === 0 ? (
        <p className="text-center text-gray-500">Aucun formateur trouvé pour ce thème.</p>
      ) : (
        <div className="space-y-8">
          {formateursSessions.map((formateur) => (
            <div key={formateur.id_formateur} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{formateur.nom_complet}</h3>
                    <p className="text-gray-600 mt-1">Tarif journalier: {formateur.tarif_journalier} €</p>
                    {formateur.cv && (
                      <a 
                        href={formateur.cv} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-teal-600 hover:underline"
                      >
                        Voir le CV
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-700 mb-3">Sessions associées</h4>
                  <div className="space-y-4">
                    {formateur.sessions.map((session, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Mode</p>
                            <p className="font-medium">{session.mode}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Durée</p>
                            <p className="font-medium">{session.duree}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Documents</p>
                            <div className="flex space-x-2 mt-1">
                              {session.fiche_prg && (
                                <a 
                                  href={session.fiche_prg} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-teal-600 hover:underline"
                                >
                                  Fiche programme
                                </a>
                              )}
                              {session.cours_session && (
                                <a 
                                  href={session.cours_session} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-teal-600 hover:underline"
                                >
                                  Cours
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormateurTheme;