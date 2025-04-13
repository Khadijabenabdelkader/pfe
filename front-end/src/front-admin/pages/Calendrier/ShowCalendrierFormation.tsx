{/*}
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CreateCalendrierFormation from './CreateCalendrierFormation';

interface Session {
  id_session: number;
  theme: string;
  code: string;
  formateur_nom: string;
  domaine: string;
  fiche_programme: string;
  type_formation: string;
  date_debut: string;
  date_fin: string;
  duree: number;
}

interface Formation {
  domaine: string;
  sessions: Session[];
}

interface FormationItem {
  domaine: {
    domaine: string;
    sessions: Session[];
  } | null;
  session: Session | null;
  nbj: number;
  date_debut: string;
  date_fin: string;
}

interface Month {
  mois: string;
  annee: string;
  formationsList: FormationItem[];
}

interface CalendrierItem {
  mois: string;
  annee: string;
  sessions: Session[];
}

const moisOrdre = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const extractDay = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '--' : date.getDate().toString();
  } catch {
    return '--';
  }
};

const calculateDuration = (date_debut: string, date_fin: string): number => {
  try {
    const start = new Date(date_debut);
    const end = new Date(date_fin);
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  } catch {
    return 0;
  }
};

const processCalendarData = (data: any[]): CalendrierItem[] => {
  const groupedData: Record<string, CalendrierItem> = {};

  (data || []).forEach((item) => {
    try {
      const dateDebut = new Date(item.date_debut);
      const moisKey = `${item.mois}-${dateDebut.getFullYear()}`;

      if (!groupedData[moisKey]) {
        groupedData[moisKey] = {
          mois: item.mois || '--',
          annee: dateDebut.getFullYear().toString(),
          sessions: []
        };
      }

      if (item.theme) {
        groupedData[moisKey].sessions.push({
          id_session: item.id_session || 0,
          theme: item.theme || '--',
          code: item.code || '--',
          formateur_nom: item.formateur_nom || '--',
          domaine: item.domaine || '--',
          fiche_programme: item.fiche_programme || '',
          type_formation: item.type_formation || '--',
          date_debut: item.date_debut || '',
          date_fin: item.date_fin || '',
          duree: item.duree || calculateDuration(item.date_debut, item.date_fin)
        });
      }
    } catch (e) {
      console.error('Error processing item:', item, e);
    }
  });

  return Object.values(groupedData).sort((a, b) => {
    const moisCompare = moisOrdre.indexOf(a.mois) - moisOrdre.indexOf(b.mois);
    return moisCompare !== 0 ? moisCompare : parseInt(a.annee) - parseInt(b.annee);
  });
};

const ShowCalendrierformation = () => {
  const [calendrier, setCalendrier] = useState<CalendrierItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState<{visible: boolean, mois?: string, annee?: string}>({visible: false});
  const [months, setMonths] = useState<Month[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const id_cal = 1743965951097  ;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/showcalendrier/${id_cal}`);
        setCalendrier(processCalendarData(response.data || []));
        
        // Simuler le chargement des formations (à remplacer par un appel API réel)
        const mockFormations: Formation[] = [
          {
            domaine: "Développement Web",
            sessions: [
              {
                id_session: 1,
                theme: "React Avancé",
                code: "REACT-ADV",
                formateur_nom: "Jean Dupont",
                domaine: "Développement Web",
                fiche_programme: "",
                type_formation: "Inter-entreprise",
                date_debut: "2023-05-15",
                date_fin: "2023-05-19",
                duree: 5
              }
            ]
          },
          {
            domaine: "Data Science",
            sessions: [
              {
                id_session: 2,
                theme: "Machine Learning",
                code: "ML-101",
                formateur_nom: "Marie Curie",
                domaine: "Data Science",
                fiche_programme: "",
                type_formation: "Intra-entreprise",
                date_debut: "2023-06-10",
                date_fin: "2023-06-14",
                duree: 5
              }
            ]
          }
        ];
        setFormations(mockFormations);
        
        // Initialiser les mois
        const initialMonths: Month[] = calendrier.map(item => ({
          mois: item.mois,
          annee: item.annee,
          formationsList: item.sessions.map(session => ({
            domaine: {
              domaine: session.domaine,
              sessions: [session]
            },
            session,
            nbj: session.duree,
            date_debut: session.date_debut,
            date_fin: session.date_fin
          }))
        }));
        setMonths(initialMonths);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setCalendrier([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id_cal]);

  const handleDeleteSession = async (id_session: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette session du calendrier ?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_APP_API_URL}/api/calendrier/${id_cal}/session/${id_session}`);
        
        setCalendrier(prevCalendrier => 
          prevCalendrier.map(moisData => ({
            ...moisData,
            sessions: moisData.sessions.filter(session => session.id_session !== id_session)
          }))
        );
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        setError('Échec de la suppression de la session');
      }
    }
  };

  const addFormationToMonth = (mois: string) => {
    const updatedMonths = months.map((month) => {
      if (month.mois === mois) {
        return {
          ...month,
          formationsList: [
            ...month.formationsList,
            {
              domaine: null,
              session: null,
              nbj: 0,
              date_debut: "",
              date_fin: "",
            },
          ],
        };
      }
      return month;
    });
    setMonths(updatedMonths);
  };

  const handleDomaineChange = (mois: string, formationIndex: number, domaineValue: string) => {
    const domaine = formations.find((f) => f.domaine === domaineValue);
    if (!domaine) return;

    const updatedMonths = months.map((month) => {
      if (month.mois === mois) {
        const updatedFormationsList = [...month.formationsList];
        updatedFormationsList[formationIndex] = {
          ...updatedFormationsList[formationIndex],
          domaine,
          session: null,
        };
        return {
          ...month,
          formationsList: updatedFormationsList,
        };
      }
      return month;
    });
    setMonths(updatedMonths);
  };

  const handleThemeChange = (mois: string, formationIndex: number, sessionId: number) => {
    const updatedMonths = months.map((month) => {
      if (month.mois === mois) {
        const updatedFormationsList = [...month.formationsList];
        const selectedDomaine = updatedFormationsList[formationIndex].domaine;
        if (selectedDomaine) {
          const session = selectedDomaine.sessions.find((s) => s.id_session === sessionId);
          if (session) {
            updatedFormationsList[formationIndex] = {
              ...updatedFormationsList[formationIndex],
              session,
            };
          }
        }
        return {
          ...month,
          formationsList: updatedFormationsList,
        };
      }
      return month;
    });
    setMonths(updatedMonths);
  };

  const handleAddSessionSubmit = async (mois: string) => {
    try {
      const monthData = months.find(m => m.mois === mois);
      if (!monthData) return;

      // Récupérer toutes les formations valides du mois
      const validFormations = monthData.formationsList.filter(f => 
        f.domaine && f.session && f.date_debut && f.date_fin
      );

      // Envoyer chaque formation au backend
      for (const formation of validFormations) {
        if (!formation.session) continue;

        await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/calendrier/${id_cal}/session`, {
          id_domaine: formation.domaine?.domaine,
          id_session: formation.session.id_session,
          nbj: formation.nbj || calculateDuration(formation.date_debut, formation.date_fin),
          mois: monthData.mois,
          date_debut: formation.date_debut,
          date_fin: formation.date_fin
        });
      }

      // Mettre à jour le calendrier
      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/showcalendrier/${id_cal}`);
      setCalendrier(processCalendarData(response.data || []));
      setShowAddForm({ visible: false });
    } catch (err) {
      console.error('Erreur lors de l\'ajout:', err);
      setError('Échec de l\'ajout de la session');
    }
  };

  const handleCreateNewCalendar = () => {
    setShowCreateForm(true);
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
  };

  if (showCreateForm) {
    return <CreateCalendrierFormation onCancel={handleCancelCreate} />;
  }

  if (loading) {
    return <div className="text-center py-8">Chargement en cours...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Erreur lors du chargement des données: {error}
      </div>
    );
  }

  if (!calendrier || calendrier.length === 0) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Calendrier de Formation</h1>
          <button
            onClick={handleCreateNewCalendar}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Créer un nouveau calendrier
          </button>
        </div>
        <div className="text-center py-8">Aucune donnée disponible</div>
      </div>
    );
  }

  // Filtrer les domaines
  const distinctDomaines = [...new Set(formations.map((formation) => formation.domaine))];
  const filteredDomaines = distinctDomaines.filter((domaine) =>
    domaine.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Calendrier de Formation</h1>
        <button
          onClick={handleCreateNewCalendar}
          className="bg-teal-500 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Créer un nouveau calendrier
        </button>
      </div>
      
      {calendrier.map((moisData, index) => (
        <div key={`${moisData.mois}-${moisData.annee}-${index}`} className="mb-8 border rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-100 px-6 py-3 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {moisData.mois} 
            </h2>
            <button
              onClick={() => setShowAddForm({visible: true, mois: moisData.mois, annee: moisData.annee})}
              className="bg-teal-500 hover:bg-teal-700 text-white text-sm py-1 px-3 rounded"
            >
              Ajouter une session
            </button>
          </div>
          
          <div className="p-4">
            {moisData.sessions && moisData.sessions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Thème</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Période</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Durée</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Formateur</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Domaine</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {moisData.sessions.map((session, idx) => (
                      <tr key={`${session.id_session}-${idx}`} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          <div className="font-medium">{session.theme}</div>
                          {session.fiche_programme && (
                            <div className="text-xs text-blue-600 mt-1">
                              <a href={session.fiche_programme} target="_blank" rel="noopener noreferrer">
                                Voir fiche programme
                              </a>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">{session.code}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          Du {extractDay(session.date_debut)} au {extractDay(session.date_fin)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">{session.duree} jours</td>
                        <td className="px-4 py-3 text-sm text-gray-800">{session.formateur_nom}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">{session.domaine}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">{session.type_formation}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          <button
                            onClick={() => handleDeleteSession(session.id_session)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer cette session"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 italic">
                Aucune session prévue ce mois
              </div>
            )}
          </div>
        </div>
      ))}

      {showAddForm.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-medium mb-4">
              Ajouter une session pour {showAddForm.mois} {showAddForm.annee}
            </h3>
            
            <div className="space-y-4">
              {months
                .find(month => month.mois === showAddForm.mois && month.annee === showAddForm.annee)
                ?.formationsList.map((formation, formationIndex) => (
                  <div key={formationIndex} className="mb-4 border p-4 rounded-lg">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">Sélectionnez un domaine</h3>
                      <input
                        type="text"
                        placeholder="Rechercher un domaine..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="p-2 border rounded w-full mb-2"
                      />
                      <select
                        value={formation.domaine?.domaine || ""}
                        onChange={(e) => handleDomaineChange(showAddForm.mois || "", formationIndex, e.target.value)}
                        className="p-2 border rounded w-full"
                      >
                        <option value="">Choisissez un domaine</option>
                        {filteredDomaines.map((domaine, index) => (
                          <option key={index} value={domaine}>
                            {domaine}
                          </option>
                        ))}
                      </select>
                    </div>

                    {formation.domaine && (
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">Sélectionnez un thème</h3>
                        <select
                          value={formation.session?.id_session || ""}
                          onChange={(e) => handleThemeChange(showAddForm.mois || "", formationIndex, parseInt(e.target.value))}
                          className="p-2 border rounded w-full"
                        >
                          <option value="">Choisissez un thème</option>
                          {formation.domaine.sessions.map((session) => (
                            <option key={session.id_session} value={session.id_session}>
                              {session.theme} ({session.date_debut} au {session.date_fin})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="block mb-2">Nombre de jours :</label>
                      <input
                        type="number"
                        placeholder="Nb jours"
                        value={formation.nbj}
                        onChange={(e) => {
                          const updatedMonths = [...months];
                          const monthIndex = updatedMonths.findIndex(m => 
                            m.mois === showAddForm.mois && m.annee === showAddForm.annee
                          );
                          if (monthIndex >= 0) {
                            updatedMonths[monthIndex].formationsList[formationIndex].nbj = Number(
                              e.target.value
                            );
                            setMonths(updatedMonths);
                          }
                        }}
                        className="p-1 border rounded mb-2 w-full"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block mb-2">Date de début :</label>
                      <input
                        type="date"
                        value={formation.date_debut}
                        onChange={(e) => {
                          const updatedMonths = [...months];
                          const monthIndex = updatedMonths.findIndex(m => 
                            m.mois === showAddForm.mois && m.annee === showAddForm.annee
                          );
                          if (monthIndex >= 0) {
                            updatedMonths[monthIndex].formationsList[formationIndex].date_debut =
                              e.target.value;
                            setMonths(updatedMonths);
                          }
                        }}
                        className="p-1 border rounded mb-2 w-full"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block mb-2">Date de fin :</label>
                      <input
                        type="date"
                        value={formation.date_fin}
                        onChange={(e) => {
                          const updatedMonths = [...months];
                          const monthIndex = updatedMonths.findIndex(m => 
                            m.mois === showAddForm.mois && m.annee === showAddForm.annee
                          );
                          if (monthIndex >= 0) {
                            updatedMonths[monthIndex].formationsList[formationIndex].date_fin =
                              e.target.value;
                            setMonths(updatedMonths);
                          }
                        }}
                        className="p-1 border rounded w-full"
                      />
                    </div>
                  </div>
                ))}

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => addFormationToMonth(showAddForm.mois || "")}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
                >
                  Ajouter une autre formation
                </button>
                
                <div className="space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm({visible: false})}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddSessionSubmit(showAddForm.mois || "")}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowCalendrierformation;*/}

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CreateCalendrierFormation from './CreateCalendrierformation';

interface Session {
  id_session: number;
  theme: string;
  code: string;
  formateur_nom: string;
  domaine: string;
  fiche_programme: string;
  type_formation: string;
  date_debut: string;
  date_fin: string;
  duree: number;
}

interface Formation {
  domaine: string;
  sessions: Session[];
}

interface FormationItem {
  domaine: {
    domaine: string;
    sessions: Session[];
  } | null;
  session: Session | null;
  nbj: number;
  date_debut: string;
  date_fin: string;
}

interface Month {
  mois: string;
  annee: string;
  formationsList: FormationItem[];
}

interface CalendrierItem {
  mois: string;
  annee: string;
  sessions: Session[];
}

const moisOrdre = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const extractDay = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '--' : date.getDate().toString();
  } catch {
    return '--';
  }
};

const calculateDuration = (date_debut: string, date_fin: string): number => {
  try {
    const start = new Date(date_debut);
    const end = new Date(date_fin);
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  } catch {
    return 0;
  }
};

const processCalendarData = (data: any[]): CalendrierItem[] => {
  const groupedData: Record<string, CalendrierItem> = {};

  (data || []).forEach((item) => {
    try {
      const dateDebut = new Date(item.date_debut);
      const moisKey = `${item.mois}-${dateDebut.getFullYear()}`;

      if (!groupedData[moisKey]) {
        groupedData[moisKey] = {
          mois: item.mois || '--',
          annee: dateDebut.getFullYear().toString(),
          sessions: []
        };
      }

      if (item.theme) {
        groupedData[moisKey].sessions.push({
          id_session: item.id_session || 0,
          theme: item.theme || '--',
          code: item.code || '--',
          formateur_nom: item.formateur_nom || '--',
          domaine: item.domaine || '--',
          fiche_programme: item.fiche_programme || '',
          type_formation: item.type_formation || '--',
          date_debut: item.date_debut || '',
          date_fin: item.date_fin || '',
          duree: item.duree || calculateDuration(item.date_debut, item.date_fin)
        });
      }
    } catch (e) {
      console.error('Error processing item:', item, e);
    }
  });

  return Object.values(groupedData).sort((a, b) => {
    const moisCompare = moisOrdre.indexOf(a.mois) - moisOrdre.indexOf(b.mois);
    return moisCompare !== 0 ? moisCompare : parseInt(a.annee) - parseInt(b.annee);
  });
};

const ShowCalendrierformation = () => {
  const [calendrier, setCalendrier] = useState<CalendrierItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState<{visible: boolean, mois?: string, annee?: string}>({visible: false});
  const [months, setMonths] = useState<Month[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const id_cal = 1744319313054
  ;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/showcalendrier/${id_cal}`);
        const calendarData = processCalendarData(response.data || []);
        setCalendrier(calendarData);
        
   
        
        // Initialiser les mois avec une formation vide pour chaque mois
        const initialMonths: Month[] = calendarData.map(item => ({
          mois: item.mois,
          annee: item.annee,
          formationsList: item.sessions.length > 0 
            ? item.sessions.map(session => ({
                domaine: {
                  domaine: session.domaine,
                  sessions: [session]
                },
                session,
                nbj: session.duree,
                date_debut: session.date_debut,
                date_fin: session.date_fin
              }))
            : [{
                domaine: null,
                session: null,
                nbj: 0,
                date_debut: new Date().toISOString().split('T')[0],
                date_fin: new Date().toISOString().split('T')[0],
              }]
        }));
        setMonths(initialMonths);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setCalendrier([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id_cal]);

  const handleDeleteSession = async (id_session: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette session du calendrier ?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/calendrier/${id_cal}/session/${id_session}`);
        
        setCalendrier(prevCalendrier => 
          prevCalendrier.map(moisData => ({
            ...moisData,
            sessions: moisData.sessions.filter(session => session.id_session !== id_session)
          }))
        );
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        setError('Échec de la suppression de la session');
      }
    }
  };

  const addFormationToMonth = (mois: string) => {
    setMonths(prevMonths => {
      // Si le mois n'existe pas encore, on le crée
      const monthExists = prevMonths.some(m => m.mois === mois);
      if (!monthExists) {
        return [
          ...prevMonths,
          {
            mois,
            annee: new Date().getFullYear().toString(),
            formationsList: [{
              domaine: null,
              session: null,
              nbj: 0,
              date_debut: new Date().toISOString().split('T')[0],
              date_fin: new Date().toISOString().split('T')[0],
            }]
          }
        ];
      }
      
      // Sinon on ajoute une formation au mois existant
      return prevMonths.map(month => {
        if (month.mois === mois) {
          return {
            ...month,
            formationsList: [
              ...month.formationsList,
              {
                domaine: null,
                session: null,
                nbj: 0,
                date_debut: new Date().toISOString().split('T')[0],
                date_fin: new Date().toISOString().split('T')[0],
              },
            ],
          };
        }
        return month;
      });
    });
  };

  const handleDomaineChange = (mois: string, formationIndex: number, domaineValue: string) => {
    const domaine = formations.find((f) => f.domaine === domaineValue);
    if (!domaine) return;

    const updatedMonths = months.map((month) => {
      if (month.mois === mois) {
        const updatedFormationsList = [...month.formationsList];
        updatedFormationsList[formationIndex] = {
          ...updatedFormationsList[formationIndex],
          domaine,
          session: null,
        };
        return {
          ...month,
          formationsList: updatedFormationsList,
        };
      }
      return month;
    });
    setMonths(updatedMonths);
  };

  const handleThemeChange = (mois: string, formationIndex: number, sessionId: number) => {
    const updatedMonths = months.map((month) => {
      if (month.mois === mois) {
        const updatedFormationsList = [...month.formationsList];
        const selectedDomaine = updatedFormationsList[formationIndex].domaine;
        if (selectedDomaine) {
          const session = selectedDomaine.sessions.find((s) => s.id_session === sessionId);
          if (session) {
            updatedFormationsList[formationIndex] = {
              ...updatedFormationsList[formationIndex],
              session,
            };
          }
        }
        return {
          ...month,
          formationsList: updatedFormationsList,
        };
      }
      return month;
    });
    setMonths(updatedMonths);
  };

  const handleAddSessionSubmit = async (mois: string) => {
    try {
      const monthData = months.find(m => m.mois === mois);
      if (!monthData) return;

      // Récupérer toutes les formations valides du mois
      const validFormations = monthData.formationsList.filter(f => 
        f.domaine && f.session && f.date_debut && f.date_fin
      );

      // Envoyer chaque formation au backend
      for (const formation of validFormations) {
        if (!formation.session) continue;

        await axios.post(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/calendrier/${id_cal}/session`, {
          id_domaine: formation.domaine?.domaine,
          id_session: formation.session.id_session,
          nbj: formation.nbj || calculateDuration(formation.date_debut, formation.date_fin),
          mois: monthData.mois,
          date_debut: formation.date_debut,
          date_fin: formation.date_fin
        });
      }

      // Mettre à jour le calendrier
      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/showcalendrier/${id_cal}`);
      setCalendrier(processCalendarData(response.data || []));
      setShowAddForm({ visible: false });
    } catch (err) {
      console.error('Erreur lors de l\'ajout:', err);
      setError('Échec de l\'ajout de la session');
    }
  };

  const handleCreateNewCalendar = () => {
    setShowCreateForm(true);
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
  };

  if (showCreateForm) {
    return <CreateCalendrierFormation onCancel={handleCancelCreate} />;
  }

  if (loading) {
    return <div className="text-center py-8">Chargement en cours...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Erreur lors du chargement des données: {error}
      </div>
    );
  }

  if (!calendrier || calendrier.length === 0) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Calendrier de Formation</h1>
          <button
            onClick={handleCreateNewCalendar}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Créer un nouveau calendrier
          </button>
        </div>
        <div className="text-center py-8">Aucune donnée disponible</div>
      </div>
    );
  }

  // Filtrer les domaines
  const distinctDomaines = [...new Set(formations.map((formation) => formation.domaine))];
  const filteredDomaines = distinctDomaines.filter((domaine) =>
    domaine.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Calendrier de Formation</h1>
        <button
          onClick={handleCreateNewCalendar}
          className="bg-teal-500 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Créer un nouveau calendrier
        </button>
      </div>
      
      {calendrier.map((moisData, index) => (
        <div key={`${moisData.mois}-${moisData.annee}-${index}`} className="mb-8 border rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-100 px-6 py-3 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {moisData.mois} {moisData.annee}
            </h2>
            <button
              onClick={() => {
                addFormationToMonth(moisData.mois);
                setShowAddForm({
                  visible: true,
                  mois: moisData.mois,
                  annee: moisData.annee
                });
              }}
              className="bg-teal-500 hover:bg-teal-700 text-white text-sm py-1 px-3 rounded"
            >
              Ajouter une session
            </button>
          </div>
          
          <div className="p-4">
            {moisData.sessions && moisData.sessions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Thème</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Période</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Durée</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Formateur</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Domaine</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {moisData.sessions.map((session, idx) => (
                      <tr key={`${session.id_session}-${idx}`} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          <div className="font-medium">{session.theme}</div>
                          {session.fiche_programme && (
                            <div className="text-xs text-blue-600 mt-1">
                              <a href={session.fiche_programme} target="_blank" rel="noopener noreferrer">
                                Voir fiche programme
                              </a>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">{session.code}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          Du {extractDay(session.date_debut)} au {extractDay(session.date_fin)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">{session.duree} jours</td>
                        <td className="px-4 py-3 text-sm text-gray-800">{session.formateur_nom}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">{session.domaine}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">{session.type_formation}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          <button
                            onClick={() => handleDeleteSession(session.id_session)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer cette session"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 italic">
                Aucune session prévue ce mois
              </div>
            )}
          </div>
        </div>
      ))}

{showAddForm.visible && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
     <br/> <br/> <br/>
    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <h3 className="text-lg font-medium mb-4 sticky top-0 bg-white py-2">
        Ajouter une session pour {showAddForm.mois} {showAddForm.annee}
      </h3>
            
      <div className="space-y-4">
       
        {months
          .find(month => month.mois === showAddForm.mois && month.annee === showAddForm.annee)
          ?.formationsList.map((formation, formationIndex) => (
            <div key={formationIndex} className="mb-4 border p-4 rounded-lg"><div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">Sélectionnez un domaine</h3>
                      <input
                        type="text"
                        placeholder="Rechercher un domaine..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="p-2 border rounded w-full mb-2"
                      />
                      <select
                        value={formation.domaine?.domaine || ""}
                        onChange={(e) => handleDomaineChange(showAddForm.mois || "", formationIndex, e.target.value)}
                        className="p-2 border rounded w-full"
                      >
                        <option value="">Choisissez un domaine</option>
                        {filteredDomaines.map((domaine, index) => (
                          <option key={index} value={domaine}>
                            {domaine}
                          </option>
                        ))}
                      </select>
                    </div>

                    {formation.domaine && (
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">Sélectionnez un thème</h3>
                        <select
                          value={formation.session?.id_session || ""}
                          onChange={(e) => handleThemeChange(showAddForm.mois || "", formationIndex, parseInt(e.target.value))}
                          className="p-2 border rounded w-full"
                        >
                          <option value="">Choisissez un thème</option>
                          {formation.domaine.sessions.map((session) => (
                            <option key={session.id_session} value={session.id_session}>
                              {session.theme} ({session.date_debut} au {session.date_fin})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="block mb-2">Nombre de jours :</label>
                      <input
                        type="number"
                        placeholder="Nb jours"
                        value={formation.nbj}
                        onChange={(e) => {
                          const updatedMonths = [...months];
                          const monthIndex = updatedMonths.findIndex(m => 
                            m.mois === showAddForm.mois && m.annee === showAddForm.annee
                          );
                          if (monthIndex >= 0) {
                            updatedMonths[monthIndex].formationsList[formationIndex].nbj = Number(
                              e.target.value
                            );
                            setMonths(updatedMonths);
                          }
                        }}
                        className="p-1 border rounded mb-2 w-full"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block mb-2">Date de début :</label>
                      <input
                        type="date"
                        value={formation.date_debut}
                        onChange={(e) => {
                          const updatedMonths = [...months];
                          const monthIndex = updatedMonths.findIndex(m => 
                            m.mois === showAddForm.mois && m.annee === showAddForm.annee
                          );
                          if (monthIndex >= 0) {
                            updatedMonths[monthIndex].formationsList[formationIndex].date_debut =
                              e.target.value;
                            setMonths(updatedMonths);
                          }
                        }}
                        className="p-1 border rounded mb-2 w-full"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block mb-2">Date de fin :</label>
                      <input
                        type="date"
                        value={formation.date_fin}
                        onChange={(e) => {
                          const updatedMonths = [...months];
                          const monthIndex = updatedMonths.findIndex(m => 
                            m.mois === showAddForm.mois && m.annee === showAddForm.annee
                          );
                          if (monthIndex >= 0) {
                            updatedMonths[monthIndex].formationsList[formationIndex].date_fin =
                              e.target.value;
                            setMonths(updatedMonths);
                          }
                        }}
                        className="p-1 border rounded w-full"
                      />
                    </div>
                  </div>
                ))}

<div className="flex justify-between pt-4 sticky bottom-0 bg-white py-4 border-t">
                
                
                <div className="space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm({visible: false})}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddSessionSubmit(showAddForm.mois || "")}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowCalendrierformation;