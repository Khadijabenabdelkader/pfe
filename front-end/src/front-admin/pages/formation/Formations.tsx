{/*import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuthAdmin";
import axios from "axios";
import { motion } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddFormation from "./AddFormation";
import UpdateFormation from "./UpdateFormation";
//import UpdateFormation from "./UpdateFormation";

interface Session {
  id_session: number;
  theme: string;
  code: string;
  type_session: string;
  lieu: string;
  etat: string;
  nb_participants: number;
  id_formateur: number;
}

interface Formation {
  id_formation: number;
  domaine: string;
  
  sessions: Session[];
}

interface Formateur {
  id_formateur: number;
  nom_complet: string;
}

const Formations: React.FC = () => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [formateurs, setFormateurs] = useState<Formateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFormationId, setSelectedFormationId] = useState<number | null>(null);
  const [showAddFormation, setShowAddFormation] = useState(false);
  const [editingFormation, setEditingFormation] = useState<Formation | null>(null);
  const { user } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionSearchQuery, setSessionSearchQuery] = useState("");
  const [showSessionSearch, setShowSessionSearch] = useState<{ [key: string]: boolean }>({});
  const [filteredFormations, setFilteredFormations] = useState<Formation[]>(formations);

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

    axios
      .get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formateurs`)
      .then((response) => {
        setFormateurs(response.data);
        console.log("Formateurs récupérés :", response.data);
      })
      .catch((err) => console.error("Erreur lors de la récupération des formateurs", err));
  }, []);

  const refreshFormations = () => {
    axios
      .get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formations/Form`)
      .then((response) => setFormations(response.data))
      .catch((err) => console.error("Erreur lors de la mise à jour des formations", err));
  };

  const getFormateurName = (session: Session) => {
    
    if (!formateurs.length) {
      return "Chargement formateur..."; // Show loading state if formateurs are not yet loaded
    }
    console.log(`Session ID: ${session.id_session}, Formateur ID: ${session.id_formateur}`);
    const formateur = formateurs.find((f) => f.id_formateur === Number(session.id_formateur));
    console.log(`Formateur trouvé: ${formateur ? formateur.nom_complet : "Aucun"}`);
    return formateur?.nom_complet ? formateur.nom_complet : "Inconnu";
  };

  if (loading) return <p className="text-center text-gray-600">Chargement...</p>;
  if (error) return <p className="text-center text-red-500">Erreur: {error}</p>;

  const domainesUniques = Array.from(new Set(formations.map((f) => f.domaine)));
  const domainesFiltres = domainesUniques.filter((domaine) =>
    domaine.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchToggle = () => setShowSearchBar(!showSearchBar);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = formations.filter((formation) => {
      const matchesDomaine = formation.domaine.toLowerCase().includes(query);
      const matchesSessionThemes = formation.sessions.some((session) =>
        session.theme.toLowerCase().includes(query)
      );

      return matchesDomaine || matchesSessionThemes;
    });

    setFilteredFormations(filtered);
  };

  const handleSessionSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSessionSearchQuery(e.target.value);

  const toggleSessionSearch = (domaine: string) => {
    setShowSessionSearch((prevState) => ({
      ...prevState,
      [domaine]: !prevState[domaine],
    }));
  };

  const handleDeleteFormation = async (id_formation: number) => {
    if (user.nom_acces !== "super_admin") {
      setErrorMessage("Vous n'avez pas l'accès pour supprimer une formation.");
      return;
    }
    if (!window.confirm("Voulez-vous vraiment supprimer cette formation ?")) {
      return;
    }

    try {
      const response = await axios.delete(`${import.meta.env.VITE_APP_API_URL}/api/formations/DEL/${id_formation}`);
      console.log("Suppression réussie:", response.data);

      setFormations((prevFormations) =>
        prevFormations.filter((formation) => formation.id_formation !== id_formation)
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Erreur lors de la suppression de la formation:", error.response?.data || error.message);
      } else {
        console.error("Erreur lors de la suppression de la formation:", error);
      }
    }
    refreshFormations();
  };

  const handleDeleteSession = async (formationId: number, sessionId: number) => {
    if (user.nom_acces !== "super_admin") {
      setErrorMessage("Vous n'avez pas l'accès pour supprimer une session.");
      return;
    }
    if (!window.confirm("Voulez-vous vraiment supprimer cette session ?")) {
      return;
    }

    try {
      await axios.delete(`${import.meta.env.VITE_APP_API_URL}/api/formations/${formationId}/sessions/${sessionId}`);
      setFormations((prevFormations) =>
        prevFormations.map((formation) =>
          formation.id_formation === formationId
            ? { ...formation, sessions: formation.sessions.filter((session) => session.id_session !== sessionId) }
            : formation
        )
      );
    } catch (error) {
      console.error("Erreur suppression session:", axios.isAxiosError(error) ? error.response?.data || error.message : error);
    }
    refreshFormations();
  };

  const handleEditFormation = (formation: Formation) => {
    setEditingFormation(formation);
  };

  const handleUpdateFormation = () => {
    setEditingFormation(null);
    refreshFormations();
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {editingFormation ? (
        <UpdateFormation
          formation={editingFormation}
          onUpdate={handleUpdateFormation}
          onCancel={() => setEditingFormation(null)}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-teal-700 text-center flex-grow">Formations</h1>
            <button onClick={handleSearchToggle} className="bg-white text-[#82b89a] p-2 rounded-full shadow hover:text-black">
              🔍
            </button>
          </div>

          {showSearchBar && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-5">
              <input
                type="text"
                placeholder="Rechercher une formation ou un thème..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full h-10 p-2 border border-black rounded-lg bg-white text-[#82b89a]"
              />
            </motion.div>
          )}
            <div className="flex justify-end p-4">
              <button
                onClick={() => setShowAddFormation(true)}
                className="bg-teal-500 text-white px-4 py-2 rounded-lg"
              >
                + Ajouter Formation
              </button>
            </div>
          
          {showAddFormation && (
            <>
              <ToastContainer />
              <AddFormation onClose={() => setShowAddFormation(false)} onFormationAdded={refreshFormations} />
            </>
          )}
          {domainesFiltres.length === 0 ? (
            <p className="text-center text-gray-500 px-4 py-2">Aucune formation trouvée.</p>
          ) : (
            domainesFiltres.map((domaine) => {
              const formationsDuDomaine = formations.filter((f) => f.domaine === domaine);

              return (
                <div key={domaine} className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold text-teal-700">{domaine}</h3>
                {(user.nom_acces === "super_admin" || user.nom_acces === "editeur formation") && (
                  <div className="flex items-center ml-auto">
                     <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditFormation(formationsDuDomaine[0]);
                      }}
                      className="text-teal-700 mr-2" >
                      éditer ✏
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFormation(formationsDuDomaine[0].id_formation);
                      }}
                      className="text-red-500 mr-2" >
                      supprimer 🗑
                    </button>
                   
                    
                  </div> 
                )}
               </div>

                  <button onClick={() => toggleSessionSearch(domaine)} className="text-teal-600 font-semibold ">
                    Rechercher sessions...
                  </button>

                  {showSessionSearch[domaine] && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-5">
                      <input
                        type="text"
                        placeholder="Rechercher une session..."
                        value={sessionSearchQuery}
                        onChange={handleSessionSearchChange}
                        className="w-full h-10 p-2 border border-black rounded-lg bg-white text-[#82b89a]"
                      />
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    {formationsDuDomaine.map((formation) => (
                      <div
                        key={formation.id_formation}
                        className="bg-white shadow-md rounded-lg p-4 border border-gray-200 cursor-pointer hover:bg-gray-100"
                        onClick={() =>
                          setSelectedFormationId(
                            selectedFormationId === formation.id_formation ? null : formation.id_formation
                          )
                        }
                      >
                        <div className="flex justify-between items-center ">
                          <div>
                            <h4 className="font-medium">{formation.domaine}</h4>
                            {formation.sessions.map((session) => (
                              <div key={session.id_session}>
                                <h5 className="font-medium">{session.theme}</h5>
                              </div>
                            ))}
                          </div>
                        </div>

                        {selectedFormationId === formation.id_formation && (
                          <>
                            {formation.sessions.length > 0 ? (
                              <table className="w-full mt-4 border-collapse border border-gray-300">
                                <thead>
                                  <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-4 py-2">Thème</th>
                                    <th className="border border-gray-300 px-4 py-2">Formateur</th>
                                    <th className="border border-gray-300 px-4 py-2">État</th>
                                    <th className="border border-gray-300 px-4 py-2">Type</th>
                                    <th className="border border-gray-300 px-4 py-2">lieu</th>
                                    <th className="border border-gray-300 px-4 py-2">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {formation.sessions
                                    .filter((session) =>
                                      session.theme.toLowerCase().includes(sessionSearchQuery.toLowerCase())
                                    )
                                    .map((session) => (
                                      <tr key={session.id_session} className="hover:bg-gray-50">
                                        <td className="border border-gray-300 px-4 py-2">{session.theme}</td>
                                        <td className="border border-gray-300 px-4 py-2">{getFormateurName(session)}</td>
                                        <td className="border border-gray-300 px-4 py-2">{session.etat}</td>
                                        <td className="border border-gray-300 px-4 py-2">{session.type_session}</td>
                                        <td className="border border-gray-300 px-4 py-2">{session.lieu}</td>

                                        <td className="border border-gray-300 px-4 py-2">
                                          <div className="flex justify-end space-x-2">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditFormation(formation);
                                              }}
                                              className="text-teal-500"
                                            >
                                              éditer ✏
                                            </button>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteSession(formation.id_formation, session.id_session);
                                              }}
                                              className="text-red-500"
                                            >
                                              supprimer 🗑
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            ) : (
                              <p>Aucune session disponible.</p>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </>
      )}
    </div>
  );
};

export default Formations;*/}
import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuthAdmin";
import axios from "axios";
import { motion } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";
import AddFormation from "./AddFormation";
import UpdateFormation from "../formation/UpdateFormation";
import Avis from "../avisParticipant";
import AvisFormateur from "../avisFormateur";
import { useNavigate, useParams } from "react-router-dom";

interface Session {
  id_session: number;
  theme: string;
  code: string;
  nb_participants:string; 
  etat: string;
  type_session: string;
  lieu:string;
  formateur: string;
  fiche_prg: string;
  id_formateur: number;
}

interface Formation {
  id_formation: number;
  domaine: string;
  sessions: Session[];
}

interface Formateur {
  id_formateur: number;
  nom_complet: string;
}
interface Avis {
  id_avis: number;
  id_participant: number;
  id_session: number;
  commentaire: string;
  date_creation: string;
  adaptation_programme_vie_pro: number;
  moyens_pedagogiques_utilises: number;
  convenance_horaires_formation: number;
  apports_niveau_professionnel: number;
  qualite_documentation_distribuee: number;
  maitrise_globale_sujets_presentes: number;
  traitement_exemples_travail: number;
  animations_seances: number;
  homogeneite_groupe: number;
  satisfaction_attentes: number;
  duree_formation: number;
}
interface AvisFormateur {
  id_avis: number; // Identifiant unique de l'avis
  date_creation: string; // Date de création de l'avis
  nom_formateur: string; // Nom du formateur
  nom_participant: string; // Nom du participant
  observation: string; // Observation ou commentaire
  connaissances_professionnelles: number;
  connaissances_equipements: number; 
  comprehension_competences: number; // Note pour la compréhension des compétences
  aptitude_appliquer_infos: number; // Note pour l'aptitude à appliquer les informations
  rapidite_execution: number; // Note pour la rapidité d'exécution
  qualite_travaux: number; // Note pour la qualité des travaux
  clarte_pertinence_resultats: number; // Note pour la clarté et pertinence des résultats
  perfectionnement_connaissances: number; // Note pour le perfectionnement des connaissances
  respect_consignes_constructeur: number; // Note pour le respect des consignes du constructeur
  respect_normes_securite: number; // Note pour le respect des normes de sécurité
  autonomie_travail: number; // Note pour l'autonomie dans le travail
  participation: number; // Note pour la participation
  assiduite_ponctualite: number; // Note pour l'assiduité et ponctualité
  initiative: number; // Note pour l'initiative
  esprit_groupe: number; // Note pour l'esprit de groupe
}

const FormationsList: React.FC = () => {
  const navigate = useNavigate();
  const [formations, setFormations] = useState<Formation[]>([]);
  const [formateurs, setFormateurs] = useState<Formateur[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [selectedFormationId, setSelectedFormationId] = useState<number | null>(null);
  const [showAddFormation, setShowAddFormation] = useState(false);

  const [editingFormation, setEditingFormation] = useState<Formation | null>(null);
  const { user } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionSearchQuery, setSessionSearchQuery] = useState("");
  const [showSessionSearch, setShowSessionSearch] = useState<{ [key: string]: boolean }>({});
  const [filteredFormations, setFilteredFormations] = useState<Formation[]>([]);
  //const [avisList, setAvisList] = useState<Avis[]>([]);
  //const [avisListf, setAvisListf] = useState<AvisFormateur[]>([]);

  const [isAvispOpen, setIsAvispOpen] = useState(false);
  const [isAvisfOpen, setIsAvisfOpen] = useState(false);

  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<number>(1);
  
  const [avisP, setAvisP] = useState<any[]>([]);  // Etat pour stocker les avis récupérés
  const [avisF,setAvisF]= useState<any[]>([]);

  useEffect(() => {
    axios
    .get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formations/Form`)
      .then((response) => {
        setFilteredFormations(response.data);
        setFormations(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    axios
    .get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formateurs`)
      .then((response) => {
        setFormateurs(response.data);
        console.log("Formateurs récupérés :", response.data);
      })
      .catch((err) => console.error("Erreur lors de la récupération des formateurs", err));
  }, []);

  const refreshFormations = () => {
    axios
    .get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formations/Form`)
      .then((response) => setFilteredFormations(response.data))
      .catch((err) => console.error("Erreur lors de la mise à jour des formations", err));
  };

  const domainesUniques = Array.from(new Set(filteredFormations.map((f) => f.domaine)));
  const domainesFiltres = domainesUniques.filter((domaine) =>
    (domaine ? domaine.toLowerCase() : ''));

  const handleSearchToggle = () => setShowSearchBar(!showSearchBar);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query === "") {
      setFilteredFormations(formations);
      return;
    }
    const filtered = filteredFormations.filter((formation) => {
      const matchesDomaine =formation.domaine ? formation.domaine.toLowerCase().includes(query):false;
      console.log("Formation:", formation.domaine, "Matches Domaine:", matchesDomaine);
      const matchesSession = formation.sessions.some((session) => {
        return (
          (session.theme?session.theme.toLowerCase().includes(query):false) ||
          (session.code?session.code.toLowerCase().includes(query):false) ||
          (session.type_session ? session.type_session.toLowerCase().includes(query):false) ||
          (session.formateur ? session.formateur.toLowerCase().includes(query):false) ||
          (session.etat? session.etat.toLowerCase().includes(query):false) 

         );
      });
      console.log("Formations:", filteredFormations);
      console.log("Search Query:", query);
      console.log("Query:", query);
      return matchesDomaine || matchesSession;
    });
  
    setFilteredFormations(filtered);
    console.log("Filtered Formations:", filtered);

  };
  
  const handleSessionSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSessionSearchQuery(e.target.value);

  const toggleSessionSearch = (domaine: string) => {
    setShowSessionSearch((prevState) => ({
      ...prevState,
      [domaine]: !prevState[domaine],
    }));
  };

  const handleDeleteFormation = async (id_formation: number) => {
    if (user.nom_acces !== "super_admin") {
      setErrorMessage("Vous n'avez pas l'accès pour supprimer une formation.");
      return;
    }
    if (!window.confirm("Voulez-vous vraiment supprimer cette formation ?")) {
      return;
    }

    try {
      const response = await axios.delete(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formations/DEL/${id_formation}`);
      console.log("Suppression réussie:", response.data);

      setFilteredFormations((prevFormations) =>
        prevFormations.filter((filteredFormations) => filteredFormations.id_formation !== id_formation)
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Erreur lors de la suppression de la formation:", error.response?.data || error.message);
      } else {
        console.error("Erreur lors de la suppression de la formation:", error);
      }
    }
    refreshFormations();
  };

  const handleDeleteSession = async (formationId: number, sessionId: number) => {
    if (user.nom_acces !== "super_admin") {
      setErrorMessage("Vous n'avez pas l'accès pour supprimer une session.");
      return;
    }
    if (!window.confirm("Voulez-vous vraiment supprimer cette session ?")) {
      return;
    }

    try {
      await axios.delete(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formations/${formationId}/sessions/${sessionId}`);
      setFilteredFormations((prevFormations) =>
        prevFormations.map((formation) =>
          formation.id_formation === formationId
            ? { ...formation, sessions: formation.sessions.filter((session) => session.id_session !== sessionId) }
            : formation
        )
      );
    } catch (error) {
      console.error("Erreur suppression session:", axios.isAxiosError(error) ? error.response?.data || error.message : error);
    }
    refreshFormations();
  };

  const handleEditFormation = (formation: Formation) => {
    setEditingFormation(formation);
  };

  const handleUpdateFormation = () => {
    setEditingFormation(null);
    refreshFormations();
  };

  const fetchAvis = async (sessionId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/avis/avisP/${sessionId}`); 
      setAvisP(response.data); 
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false); 
    }
  };
  const fetchAvisf = async (sessionId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/avis/avisF/${sessionId}`); 
      setAvisF(response.data); 
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false); 
    }
  };

  const handleViewAvisParticipants = (sessionId: number) => {
    setSessionId(sessionId);
    setIsAvispOpen(true);
    fetchAvis(sessionId); 
  };
  
  const handleViewAvisFormateurs = (sessionId: number) => {
    setSessionId(sessionId);
    setIsAvisfOpen(true);
    fetchAvisf(sessionId); 
  };
  



  const getFormateurName = (session: Session) => {
    
    if (!formateurs.length) {
      return "Chargement formateur...";
    }
    if (session.id_formateur === undefined) {
      console.error("id_formateur est undefined pour la session :", session);
      return "Inconnu";
    }
    console.log(`Session ID: ${session.id_session}, Formateur ID: ${session.id_formateur}`);
    const formateur = formateurs.find((f) => f.id_formateur === Number(session.id_formateur));
    console.log(`Formateur trouvé: ${formateur ? formateur.nom_complet : "Aucun"}`);
    return formateur?.nom_complet ? formateur.nom_complet : "Inconnu";
  };

  if (loading) return <p className="text-center text-gray-600">Chargement...</p>;
  if (error) return <p className="text-center text-red-500">Erreur: {error}</p>;


  return (
    <div className="max-w-4xl mx-auto p-4">
      {editingFormation ? (
        <UpdateFormation
          formation={editingFormation}
          onUpdate={handleUpdateFormation}
          onCancel={() => setEditingFormation(null)}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-teal-700 text-center flex-grow">Formations</h1>
            <button onClick={handleSearchToggle} className="bg-white text-[#82b89a] p-2 rounded-full shadow hover:text-black">
              🔍
            </button>
           
          </div>
          
          {showSearchBar && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-5">
              <input
                type="text"
                placeholder="Rechercher une formation ou un thème..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full h-10 p-2 border border-black rounded-lg bg-white text-[#82b89a]"
              />
            </motion.div>
            
          )}
      {loading && <p className="text-center text-gray-500">Chargement...</p>}
      {error && <p className="text-center text-red-600 font-bold">{error}</p>}

            <div className="flex justify-end p-4">
              <button
                onClick={() => setShowAddFormation(true)}
                className="bg-teal-500 text-white px-4 py-2 rounded-lg"
               >
                + Planifier Formation ?
              </button>
            </div>
            {showAddFormation && (
              <AddFormation onFormationAdded={refreshFormations} onClose={() => setShowAddFormation(false)}  />)
            }

            

          {filteredFormations.length === 0 ? (
            <p className="text-center text-gray-500 px-4 py-2">Aucune formation trouvée.</p>
          ) : (

                Array.from(new Set(filteredFormations.map((f) => f.domaine))).map((domaine) => {
                const formationsDuDomaine = filteredFormations.filter((f) => f.domaine === domaine);
                return (
                <div key={domaine} className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold text-teal-700">{domaine}</h3>
                
               </div>
                  

                  {showSessionSearch[domaine] && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-5">
                      <input
                        type="text"
                        placeholder="Rechercher une session..."
                        value={sessionSearchQuery}
                        onChange={handleSessionSearchChange}
                        className="w-full h-10 p-2 border border-black rounded-lg bg-white text-[#82b89a]"
                      />
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    {formationsDuDomaine.map((formation) => (
                      <div
                        key={formation.id_formation}
                        className="bg-white shadow-md rounded-lg p-4 border border-gray-200 cursor-pointer hover:bg-gray-100"
                        onClick={() =>
                          setSelectedFormationId(
                            selectedFormationId === formation.id_formation ? null : formation.id_formation
                          )}
                       >
                          <div>
                          {(user.nom_acces === "super_admin" || user.nom_acces === "editeur formation") && (
                              <div className="flex justify-end p-4">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditFormation(formationsDuDomaine[0]);
                                  }}
                                  className="text-teal-700 mr-2" >
                                  éditer ✏️
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteFormation(formationsDuDomaine[0].id_formation);
                                  }}
                                  className="text-red-500 mr-2" >
                                  supprimer 🗑️
                                </button>
                              </div> 
                            )}
                            <h4 className="font-medium">{formation.domaine}</h4>
                            {formation.sessions.map((session) => (
                              <div key={session.id_session}>
                                <h5 className="font-medium">{session.theme}</h5>
                              </div>
                            ))}
                          </div>
                       

                        {selectedFormationId === formation.id_formation && (
                          <>
                            {formation.sessions.length > 0 ? (
                              <table className="w-full text-gray-600 mt-4 border-collapse border border-gray-300">
                                <thead>
                                  <tr className="bg-gray-100">
                                    <th className="border text-gray-600 border-gray-300 px-4 py-2">Thème</th>
                                    <th className="border border-gray-300 px-4 py-2">Code</th>
                                    <th className="border border-gray-300 px-4 py-2">Formateur</th>
                                    <th className="border border-gray-300 px-4 py-2">Fiche programme</th>

                                    <th className="border border-gray-300 px-4 py-2">etat</th>
                                    <th className="border border-gray-300 px-4 py-2">Type</th>
                                    <th className="border border-gray-300 px-4 py-2">nombre de participants</th>
                                    <th className="border border-gray-300 px-4 py-2">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {formation.sessions
                                  .map((session) => (
                                    <tr key={session.id_session} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 px-4 py-2">{session.theme}</td>
                                    <td className="border border-gray-300 px-4 py-2">{session.code}</td>
                                    <td className="border border-gray-300 px-4 py-2">{getFormateurName(session)}</td>
                                    <td className="border border-gray-300 px-4 py-2">{session.fiche_prg}</td>

                                    <td className="border border-gray-300 px-4 py-2">{session.etat}</td>
                                    <td className="border border-gray-300 px-4 py-2">{session.type_session} à {session.lieu} </td>
                                    <td className="border border-gray-300 px-4 py-2">{session.nb_participants}</td>

                                    <td className="border border-gray-300 px-4 py-2">
                                          <>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditFormation(formation);
                                              }}
                                              className="text-teal-500"
                                            >
                                              éditer ✏️
                                            </button>
                                            
                                          </>
                                        
                                        {session.etat === "déjà réalisé" && (
                                          <>
                                              <button onClick={() => handleViewAvisParticipants(1)}  className="text-teal-500">
                                                avis participants 🌟 </button>
                                              {isAvispOpen && loading && <p>Chargement...</p>} 
                                              {isAvispOpen && error && <p>{error}</p>}
                                              {isAvispOpen && !loading && (
                                              <Avis avisList={avisP}  loading={loading}  error={error}  onClose={() => setIsAvispOpen(false)} />
                                              )}
                                         
                                           <button onClick={() => handleViewAvisFormateurs(1)} className="text-teal-500">
                                             avis Formateur 🌟 </button>
                                           {isAvisfOpen && loading && <p>Chargement...</p>} 
                                           {isAvisfOpen && error && <p>{error}</p>}
                                           {isAvisfOpen && !loading && (
                                           <AvisFormateur avisList={avisF}  loading={loading}  error={error}  onClose={() => setIsAvisfOpen(false)} />
                                           )}
                                       </>
                                        )}
                                    </td>
                                  </tr>
                                   ))}
                                  {isAvispOpen && <Avis avisList={avisP}  loading={loading}  error={error} onClose={() => setIsAvispOpen(false)} />}
                                  {isAvisfOpen && <AvisFormateur avisList={avisF}  loading={loading}  error={error} onClose={() => setIsAvisfOpen(false)} />}

                                </tbody>
                              </table>
                            ) : (
                              <p>Aucune session disponible.</p>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </>
      )}
    </div>
  );
};
export default FormationsList;