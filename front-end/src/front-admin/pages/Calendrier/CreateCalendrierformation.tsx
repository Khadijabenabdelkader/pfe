{/*import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

interface Session {
  id_formation: number;
  id_session: number;
  theme: string;
  date_debut: string;
  date_fin: string;
  duree: number;
  
}

interface Formation {
  id_formation: number;
  domaine: string;
  sessions: Session[];
}

interface FormationInMonth {
  formation: Formation | null;
  session: Session | null;
  date_debut: string;
  date_fin: string;
  duree: number;
}

interface MonthData {
  mois: string;
  year: number;
  month: number;
  formations: FormationInMonth[];
}

const CalendrierFormation: React.FC = () => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [startMonth, setStartMonth] = useState<string>("");
  const [months, setMonths] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les formations
  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formations/Form`);
        setFormations(response.data);
        setLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    };
    
    fetchFormations();
  }, []);

  const generateMonths = (startDateStr: string) => {
    const startDate = new Date(startDateStr);
    const monthsArray: MonthData[] = [];
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      monthsArray.push({
        mois: date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' }),
        year: date.getFullYear(),
        month: date.getMonth(),
        formations: [],
      });
    }
    
    setMonths(monthsArray);
  };

  const addFormationToMonth = (monthIndex: number) => {
    setMonths(prev => {
      const updated = [...prev];
      updated[monthIndex].formations.push({
        formation: null,
        session: null,
        date_debut: "",
        date_fin: "",
        duree:0
      });
      return updated;
    });
  };

  const handleFormationChange = (monthIndex: number, formationIndex: number, id_formation: number) => {
    const formation = formations.find(f => f.id_formation === id_formation);
    if (!formation) return;

    setMonths(prev => {
      const updated = [...prev];
      updated[monthIndex].formations[formationIndex] = {
        ...updated[monthIndex].formations[formationIndex],
        formation,
        session: null,
        date_debut: "",
        date_fin: "",
        duree:0
      };
      return updated;
    });
  };

  const handleSessionChange = (monthIndex: number, formationIndex: number, id_session: number) => {
    setMonths(prev => {
      const updated = [...prev];
      const formation = updated[monthIndex].formations[formationIndex].formation;
      
      if (formation) {
        const session = formation.sessions.find(s => s.id_session === id_session);
        if (session) {
          updated[monthIndex].formations[formationIndex] = {
            ...updated[monthIndex].formations[formationIndex],
            session,
            date_debut: session.date_debut,
            date_fin: session.date_fin,
            duree:session.duree
          };
        }
      }
      
      return updated;
    });
  };

  const saveSessions = async () => {
    try {
      // Préparer toutes les sessions à sauvegarder
      const sessionsToSave = months.flatMap(month => 
        month.formations
          .filter(f => f.formation && f.session)
          .map(f => ({
            id_session: f.session?.id_session || null,
            id_formation: f.formation?.id_formation,
            theme: f.session?.theme || `Session ${f.formation?.domaine}`,
            date_debut: f.date_debut,
            date_fin: f.date_fin,
            duree: f.duree,
           
          }))
      );

      // Envoyer chaque session au backend
      await Promise.all(sessionsToSave.map(session => 
        axios.post(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/create/calendrierformation`, session)
      ));

      alert('Calendrier sauvegardé avec succès!');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  if (error) return <div className="text-red-500 p-4">Erreur : {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Planification des Formations</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <label className="block text-lg font-medium mb-2">Mois de départ :</label>
        <input
          type="month"
          value={startMonth}
          onChange={(e) => {
            setStartMonth(e.target.value);
            generateMonths(e.target.value);
          }}
          className="p-2 border border-gray-300 rounded-md w-full max-w-xs"
        />
      </div>

      {months.map((month, monthIndex) => (
        <div key={monthIndex} className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-teal-700">{month.mois}</h2>

          {month.formations.map((formation, formationIndex) => (
            <div key={formationIndex} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Formation</label>
                  <select
                    value={formation.formation?.id_formation || ""}
                    onChange={(e) => handleFormationChange(monthIndex, formationIndex, parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Sélectionnez une formation</option>
                    {formations.map(f => (
                      <option key={f.id_formation} value={f.id_formation}>
                        {f.domaine}
                      </option>
                    ))}
                  </select>
                </div>

                {formation.formation && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Session</label>
                    <select
                      value={formation.session?.id_session || ""}
                      onChange={(e) => handleSessionChange(monthIndex, formationIndex, parseInt(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Sélectionnez une session</option>
                      {formation.formation.sessions.map(s => (
                        <option key={s.id_session} value={s.id_session}>
                          {s.theme} ({s.duree} jours)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="mb-2">
                    <label className="block text-gray-700">Durée</label>
                    <input
                      type="number"
                      value={formation.duree}
                      onChange={(e) =>{
                        const updated = [...months];
                        updated[monthIndex].formations[formationIndex].duree = parseInt(e.target.value, 10) || 0;
                        setMonths(updated);
                      }}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Date de début</label>
                  <input
                    type="date"
                    value={formation.date_debut}
                    onChange={(e) => {
                      const updated = [...months];
                      updated[monthIndex].formations[formationIndex].date_debut = e.target.value;
                      setMonths(updated);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date de fin</label>
                  <input
                    type="date"
                    value={formation.date_fin}
                    onChange={(e) => {
                      const updated = [...months];
                      updated[monthIndex].formations[formationIndex].date_fin = e.target.value;
                      setMonths(updated);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => addFormationToMonth(monthIndex)}
            className="mt-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition"
          >
            Ajouter une formation
          </button>
        </div>
      ))}

      <div className="flex justify-end space-x-4 mt-6">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md transition"
        >
          Annuler
        </button>
        <button
          onClick={saveSessions}
          className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition"
          disabled={!startMonth}
        >
          Sauvegarder
        </button>
      </div>
    </div>
  );
};

export default CalendrierFormation;*/}
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

interface Session {
  id_formation: number;
  id_session: number;
  theme: string;
  date_debut: string;
  date_fin: string;
  duree: number;
}

interface Formation {
  id_formation: number;
  domaine: string;
  sessions: Session[];
}

interface FormationInMonth {
  formation: Formation | null;
  session: Session | null;
  date_debut: string;
  date_fin: string;
  duree: number;
}

interface MonthData {
  mois: string;
  year: number;
  month: number;
  formations: FormationInMonth[];
}

const CalendrierFormation: React.FC = () => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [startMonth, setStartMonth] = useState<string>("");
  const [months, setMonths] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: string, message: string} | null>(null);

  // Charger les formations
  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formations/Form`);
        setFormations(response.data);
        setLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    };
    
    fetchFormations();
  }, []);

  const generateMonths = (startDateStr: string) => {
    const startDate = new Date(startDateStr);
    const monthsArray: MonthData[] = [];
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      monthsArray.push({
        mois: date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' }),
        year: date.getFullYear(),
        month: date.getMonth(),
        formations: [],
      });
    }
    
    setMonths(monthsArray);
  };

  const addFormationToMonth = (monthIndex: number) => {
    setMonths(prev => {
      const updated = [...prev];
      updated[monthIndex].formations.push({
        formation: null,
        session: null,
        date_debut: "",
        date_fin: "",
        duree: 0
      });
      return updated;
    });
  };

  const handleFormationChange = (monthIndex: number, formationIndex: number, id_formation: number) => {
    const formation = formations.find(f => f.id_formation === id_formation);
    if (!formation) return;
    
    setMonths(prev => {
      const updated = [...prev];
      updated[monthIndex].formations[formationIndex] = {
        ...updated[monthIndex].formations[formationIndex],
        formation,
        session: null,
        date_debut: "",
        date_fin: "",
        duree: 0
      };
      return updated;
    });
  };

  const handleSessionChange = (monthIndex: number, formationIndex: number, id_session: number) => {
    setMonths(prev => {
      const updated = [...prev];
      const formation = updated[monthIndex].formations[formationIndex].formation;
      
      if (formation) {
        const session = formation.sessions.find(s => s.id_session === id_session);
        if (session) {
          updated[monthIndex].formations[formationIndex] = {
            ...updated[monthIndex].formations[formationIndex],
            session,
            date_debut: session.date_debut,
            date_fin: session.date_fin,
            duree: session.duree
          };
        }
      }
      
      return updated;
    });
  };

const saveSessions = async () => {
  try {
    // Prepare all sessions to save
    const sessionsToSave = months.flatMap(month => 
      month.formations
        .filter(f => f.formation && f.date_debut && f.date_fin)
        .map(f => ({
          id_formation: f.formation?.id_formation,
          id_session: f.session?.id_session || null,
          theme: f.session?.theme || `Session ${f.formation?.domaine}`,
          date_debut: f.date_debut,
          date_fin: f.date_fin,
          duree: f.duree || 0,
        }))
    );

    if (sessionsToSave.length === 0) {
      setNotification({
        type: "error",
        message: "Aucune formation sélectionnée à sauvegarder"
      });
      return;
    }

    console.log("Data being sent to server:", JSON.stringify(sessionsToSave));

    // Explicitly send as array with proper content type and configurations
    const response = await axios({
      method: 'post',
      url: `${import.meta.env.VITE_APP_API_URL}/apiAdmin/create/calendrierformation`,
      data: sessionsToSave,
      headers: { 
        'Content-Type': 'application/json'
      },
      transformRequest: [(data) => JSON.stringify(data)], // Ensure proper JSON formatting
    });

    if (response.status === 201 || response.status === 200) {
      setNotification({
        type: "success",
        message: "Calendrier sauvegardé avec succès!"
      });
      
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  } catch (error: any) {
    console.error('Erreur:', error);
    
    if (error.response) {
      console.log("Server responded with:", error.response.data);
    }
    
    setNotification({
      type: "error",
      message: "Erreur lors de la sauvegarde: " + error.message
    });
  }
};

  if (loading) return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  if (error) return <div className="text-red-500 p-4">Erreur : {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Planification des Formations</h1>
      
      {notification && (
        <div className={`p-4 mb-6 rounded-md ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {notification.message}
          <button 
            onClick={() => setNotification(null)}
            className="ml-4 text-sm underline"
          >
            Fermer
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <label className="block text-lg font-medium mb-2">Mois de départ :</label>
        <input
          type="month"
          value={startMonth}
          onChange={(e) => {
            setStartMonth(e.target.value);
            generateMonths(e.target.value);
          }}
          className="p-2 border border-gray-300 rounded-md w-full max-w-xs"
        />
      </div>

      {months.map((month, monthIndex) => (
        <div key={monthIndex} className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-teal-700">{month.mois}</h2>
          
          {month.formations.map((formation, formationIndex) => (
            <div key={formationIndex} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Formation</label>
                  <select
                    value={formation.formation?.id_formation || ""}
                    onChange={(e) => handleFormationChange(monthIndex, formationIndex, parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Sélectionnez une formation</option>
                    {formations.map(f => (
                      <option key={f.id_formation} value={f.id_formation}>
                        {f.domaine}
                      </option>
                    ))}
                  </select>
                </div>
                
                {formation.formation && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Session</label>
                    <select
                      value={formation.session?.id_session || ""}
                      onChange={(e) => handleSessionChange(monthIndex, formationIndex, parseInt(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Sélectionnez une session</option>
                      {formation.formation.sessions.map(s => (
                        <option key={s.id_session} value={s.id_session}>
                          {s.theme} ({s.duree} jours)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="mb-2">
                  <label className="block text-gray-700">Durée</label>
                  <input
                    type="number"
                    value={formation.duree}
                    onChange={(e) =>{
                      const updated = [...months];
                      updated[monthIndex].formations[formationIndex].duree = parseInt(e.target.value, 10) || 0;
                      setMonths(updated);
                    }}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Date de début</label>
                  <input
                    type="date"
                    value={formation.date_debut}
                    onChange={(e) => {
                      const updated = [...months];
                      updated[monthIndex].formations[formationIndex].date_debut = e.target.value;
                      setMonths(updated);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Date de fin</label>
                  <input
                    type="date"
                    value={formation.date_fin}
                    onChange={(e) => {
                      const updated = [...months];
                      updated[monthIndex].formations[formationIndex].date_fin = e.target.value;
                      setMonths(updated);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <button
            onClick={() => addFormationToMonth(monthIndex)}
            className="mt-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition"
          >
            Ajouter une formation
          </button>
        </div>
      ))}

      <div className="flex justify-end space-x-4 mt-6">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md transition"
        >
          Annuler
        </button>
        <button
          onClick={saveSessions}
          className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition"
          disabled={!startMonth}
        >
          Sauvegarder
        </button>
      </div>
    </div>
  );
};

export default CalendrierFormation;