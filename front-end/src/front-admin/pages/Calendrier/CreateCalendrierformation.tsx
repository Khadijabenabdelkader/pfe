
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

interface CreateCalendrierFormationProps {
  onCancel: () => void;
}


interface CalendrierData {
  id_cal: number;
  id_domaine: number;
  id_session: number;
  nbj: number;
  mois: string;
  date_debut: string;
  date_fin: string;
}

interface Session {
  id_session: number;
  theme: string;
  code: string;
  date_debut: string;
  date_fin: string;
  duree: number;
  etat: string;
  type_session: string;
  formateur: string;
  id_formateur: number;
  id_formation: number;
}

interface Formation {
  id_formation: number;
  domaine: string;
  sessions: Session[];
}

interface FormationInMonth {
  domaine: Formation | null;
  session: Session | null;
  nbj: number;
  date_debut: string;
  date_fin: string;
}

interface MonthData {
  mois: string;
  formationsList: FormationInMonth[];
}

const Calendrierformation: React.FC<CreateCalendrierFormationProps> = ({ onCancel }) => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [startMonth, setStartMonth] = useState<string>("");
  const [months, setMonths] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Charger les formations
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formations/Form`)
      .then((response) => {
        setFormations(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const generateMonths = (startMonth: string) => {
    const startDate = new Date(startMonth);
    const monthsArray: MonthData[] = [];
    for (let i = 0; i < 6; i++) {
      const month = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      monthsArray.push({
        mois: month.toLocaleString("default", { month: "long", year: "numeric" }),
        formationsList: [],
      });
    }
    setMonths(monthsArray);
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

  const saveCalendrier = async () => {
    try {
      // Préparer les données pour l'envoi
      const dataToSend = months.flatMap((month) => {
        // Pour chaque formation dans le mois
        const monthFormations = month.formationsList.map((formation) => ({
          id_domaine: formation.domaine?.id_formation || null,
          id_session: formation.session?.id_session || null,
          nbj: formation.nbj || 0,
          mois: month.mois,
          date_debut: formation.date_debut || null,
          date_fin: formation.date_fin || null,
        }));

        // Si pas de formations, ajouter une entrée vide pour le mois
        if (monthFormations.length === 0) {
          return [{
            id_domaine: null,
            id_session: null,
            nbj: 0,
            mois: month.mois,
            date_debut: null,
            date_fin: null,
          }];
        }

        return monthFormations;
      });

      console.log("Données préparées:", dataToSend);

      // Envoyer les données au backend
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/apiAdmin/create/calendrierformation`,
        dataToSend,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status !== 201 && response.status !== 200) {
        throw new Error("Erreur lors de la sauvegarde");
      }

      alert("Calendrier sauvegardé avec succès!");
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la sauvegarde");
    }
  };

  // Filtrer les domaines
  const distinctDomaines = [...new Set(formations.map((formation) => formation.domaine))];
  const filteredDomaines = distinctDomaines.filter((domaine) =>
    domaine.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Créer un Calendrier</h1>

      <div className="mb-4">
        <label className="block mb-2">Mois de départ :</label>
        <input
          type="month"
          value={startMonth}
          onChange={(e) => {
            setStartMonth(e.target.value);
            generateMonths(e.target.value);
          }}
          className="p-2 border rounded"
        />
      </div>

      {months.map((month, monthIndex) => (
        <div key={monthIndex} className="mb-6 border p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">{month.mois}</h2>

          {month.formationsList.map((formation, formationIndex) => {
            const availableSessions = formation.domaine?.sessions || [];

            return (
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
                    onChange={(e) => handleDomaineChange(month.mois, formationIndex, e.target.value)}
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
                      onChange={(e) => handleThemeChange(month.mois, formationIndex, parseInt(e.target.value))}
                      className="p-2 border rounded w-full"
                    >
                      <option value="">Choisissez un thème</option>
                      {availableSessions.map((session) => (
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
                      updatedMonths[monthIndex].formationsList[formationIndex].nbj = Number(
                        e.target.value
                      );
                      setMonths(updatedMonths);
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
                      updatedMonths[monthIndex].formationsList[formationIndex].date_debut =
                        e.target.value;
                      setMonths(updatedMonths);
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
                      updatedMonths[monthIndex].formationsList[formationIndex].date_fin =
                        e.target.value;
                      setMonths(updatedMonths);
                    }}
                    className="p-1 border rounded w-full"
                  />
                </div>
              </div>
            );
          })}

          <button
            onClick={() => addFormationToMonth(month.mois)}
            className="mt-2 p-2 bg-teal-500 text-white rounded"
          >
            Ajouter une formation dans ce mois
          </button>
        </div>
      ))}

      <button 
        onClick={saveCalendrier} 
        className="mt-4 p-2 bg-teal-500 text-white rounded hover:bg-teal-600"
      >
        Sauvegarder le calendrier
      </button>
      <button
      onClick={onCancel}
      className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-md transition duration-200"
    >
      Annuler
    </button>
    </div>
  );
}

export default Calendrierformation;