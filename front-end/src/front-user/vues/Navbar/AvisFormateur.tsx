import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Radio, Table, Button, Card, Form, Select, Typography, Input, Alert } from 'antd';
import html2canvas from 'html2canvas';
import  jsPDF  from 'jspdf';

const { TextArea } = Input;

type Theme = {
  id: number;
  id_presence: number;
  nom: string;
  lieu: string;
  type_session: string;
  etat: string;
  entreprise_beneficiaire?: string;
  nb_participants?: number;
};

type Participant = {
  id_participant: number;
  nom_complet: string;
};

type PresenceData = {
  id_presence: number;
  entreprise_beneficiaire: string;
  date_debut: string;
  date_fin: string;
  id_session: number;
  participants: Participant[];
};

type Evaluation = {
  [key: string]: any; // Ou définissez un type plus précis pour les évaluations
  observation?: string;
};
const AvisFormateur = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // États pour stocker les données
  const [formateur, setFormateur] = useState(null);
  const [formateurNom, setFormateurNom] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<number | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [evaluations, setEvaluations] = useState<Record<number, Evaluation>>({});
  const [formData, setFormData] = useState({
    id_presence: undefined,
    entreprise: '',
    formateur: '',
    organisme_formation: '',
    periode: '',
    theme: ''
  });

  // Options pour les radio buttons
  const options = [
    { label: 'Insuffisant', value: 'insuffisant' },
    { label: 'Passable', value: 'passable' },
    { label: 'Assez bien', value: 'assez bien' },
    { label: 'Bien', value: 'bien' },
    { label: 'Très bien', value: 'tres bien' },
  ];

  // Données pour le tableau d'évaluation
  const evaluationData = [
    { critere: 'Connaissances professionnelles', field: 'connaissances_professionnelles' },
    { critere: 'Connaissances des équipements utilisés', field: 'connaissances_equipements' },
    { critere: 'Compréhension des compétences proposées', field: 'comprehension_competences' },
    { critere: 'Aptitude à appliquer les informations reçues', field: 'aptitude_appliquer_infos' },
    { critere: 'Rapidité d\'exécution et d\'intervention', field: 'rapidite_execution' },
    { critere: 'Qualité des travaux réalisés', field: 'qualite_travaux' },
    { critere: 'Clarté et pertinence des résultats', field: 'clarte_pertinence_resultats' },
    { critere: 'Perfectionnement des connaissances acquises difficilement', field: 'perfectionnement_connaissances' },
    { critere: 'Respect des consignes constructeur', field: 'respect_consignes_constructeur' },
    { critere: 'Respect des normes de sécurité', field: 'respect_normes_securite' },
    { critere: 'Autonomie dans le travail', field: 'autonomie_travail' },
    { critere: 'Participation (Actif, retiré)', field: 'participation' },
    { critere: 'Assiduité - Ponctualité', field: 'assiduite_ponctualite' },
    { critere: 'Initiative', field: 'initiative' },
    { critere: 'Esprit de groupe', field: 'esprit_groupe' },
  ];
  const generatePDF = async () => {
    const input = document.getElementById('evaluation-content');
    if (!input) return;

    setLoading(true);
    
    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`evaluation-${formData.theme}-${new Date().toISOString().slice(0,10)}.pdf`);
      
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      setError('Erreur lors de la génération du PDF');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        // Vérifiez que l'ID est bien un nombre
        const formateurId = userData.id;
        if (!isNaN(formateurId)) {
          setFormateur(formateurId);
          setFormateurNom(userData.nom_complet || '');
          setFormData(prev => ({
            ...prev,
            formateur: userData.nom_complet || '',
          }));
        } else {
          console.error("ID formateur invalide");
        }
      } catch (error) {
        console.error("Erreur parsing user data", error);
      }
    }
  }, []);

  useEffect(() => {
    if (formateur) {
        fetchSessions();
    }
  }, [formateur]);

  const fetchSessions = async () => {
    if (!formateur) {
      console.error("ID du formateur manquant");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const url = `${import.meta.env.VITE_APP_API_URL}/apiUser/themes?idFormateur=${formateur}`;
      
      const response = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.data && response.data.sessions && Array.isArray(response.data.sessions)) {
        setThemes(response.data.sessions);
      } else if (Array.isArray(response.data)) {
        setThemes(response.data);
      } else {
        console.error("Structure de réponse inattendue:", response.data);
        setError("Format de données inconnu reçu du serveur");
        setThemes([]);
      }
      
    } catch (error) {
      console.error("Erreur détaillée:", error);
      setError(error.response?.data?.message || "Échec du chargement des sessions");
      setThemes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = async (themeId) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedTheme(themeId);

      const selectedThemeData = themes.find(theme => Number(theme.id) === Number(themeId));
      
      if (!selectedThemeData) {
        throw new Error("Thème introuvable dans les données chargées.");
      }
      
      if (!selectedThemeData.id_presence) {
        throw new Error("ID de présence introuvable pour ce thème.");
      }

      const token = localStorage.getItem('token');
      const presenceResponse = await axios.get(
        `${import.meta.env.VITE_APP_API_URL}/apiUser/feuille-presence/${selectedThemeData.id_presence}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!presenceResponse.data || !presenceResponse.data.id_presence) {
        throw new Error("Données de présence incorrectes");
      }

      setFormData({
        entreprise: presenceResponse.data.entreprise_beneficiaire || "",
        formateur: formateurNom, // Utilisation du nom du formateur depuis le state
        organisme_formation: formData.organisme_formation || "", // Conserve la valeur existante
        periode: `${presenceResponse.data.date_debut} - ${presenceResponse.data.date_fin}`,
        theme: selectedThemeData.nom,
        id_presence: presenceResponse.data.id_presence,
      });

      setParticipants(presenceResponse.data.participants || []);

      // Initialiser les évaluations pour chaque participant
      const initialEvaluations = {};
      presenceResponse.data.participants?.forEach(participant => {
        initialEvaluations[participant.id_participant] = {
          observation: ''
        };
      });
      setEvaluations(initialEvaluations);

    } catch (error) {
      console.error("Erreur:", error);
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOrganismeChange = (e) => {
    setFormData({
      ...formData,
      organisme_formation: e.target.value
    });
  };

  const handleEvaluationChange = (id_participant, field, value) => {
    setEvaluations(prev => ({
      ...prev,
      [id_participant]: {
        ...prev[id_participant],
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
  
      // Validation des données
      if (!formData.id_presence) {
        throw new Error("ID de présence manquant");
      }
  
      
      const token = localStorage.getItem('token'); // Utilisez 'token' au lieu de 'user'
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
  
      // Vérification des évaluations
      if (Object.keys(evaluations).length === 0) {
        throw new Error("Aucune évaluation à enregistrer");
      }
  
      const validEvaluations = Object.fromEntries(
        Object.entries(evaluations)
          .filter(([participantId]) => 
            participants.some(p => p.id_participant.toString() === participantId)
          )
      );
      
      
      const dataToSend = {
        id_formateur: userData.id,
        id_presence: formData.id_presence,
        organisme_formation: formData.organisme_formation,
        evaluations: validEvaluations
      };
  
      console.log('Données envoyées:', dataToSend); // Debug
  
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/apiUser/evaluation`,
        dataToSend,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,          } 
        }
      );
  
      if (response.data.message) {
        setSuccess('Évaluations enregistrées avec succès!');
        await generatePDF();
        setEvaluations({});
        setFormData({
          entreprise: '',
          formateur: userData.id ,
          organisme_formation: '',
          periode: '',
          theme: '',
          id_presence: undefined
        });
      }
  
    } catch (err: any) {
      console.error("Erreur détaillée:", err.response?.data || err.message);
      setError(err.response?.data?.message || err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div id="evaluation-content" className="min-h-screen  bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl pt-20 mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Formulaire d'évaluation des participants</h1>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
            <p>{success}</p>
          </div>
        )}

        <div className="mb-8">
          <label className="block text-gray-700 font-medium mb-2">Thème de la formation</label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md"
            onChange={(e) => handleThemeChange(e.target.value)}
            value={selectedTheme || ''}
            disabled={loading}
          >
            <option value="">Sélectionnez un thème</option>
            {themes.map((theme: Theme) => (
    <option key={theme.id} value={theme.id}>
      {theme.nom} ({theme.lieu}, {theme.nb_participants} participants)
    </option>
  ))}
          </select>
        </div>
        
        {selectedTheme && (
          <>
            <div className="bg-gray-100 p-4 rounded-lg mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Informations générales</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Entreprise:</p>
                  <p className="font-medium">{formData.entreprise}</p>
                </div>
                <div>
                  <p className="text-gray-600">Formateur:</p>
                  <p className="font-medium">{formData.formateur}</p>
                </div>
                <div>
                  <p className="text-gray-600">Organisme de formation:</p>
                  <Input
                    value={formData.organisme_formation}
                    onChange={handleOrganismeChange}
                    placeholder="Entrez le nom de l'organisme"
                  />
                </div>
                <div>
                  <p className="text-gray-600">Période:</p>
                  <p className="font-medium">{formData.periode}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gray-600">Thème:</p>
                  <p className="font-medium">{formData.theme}</p>
                </div>
              </div>
            </div>

            {participants.length > 0 ? (
              participants.map(participant => (
                <div key={participant.id_participant} className="border border-gray-200 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Participant: {participant.nom_complet}</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Critères d'évaluation
                          </th>
                          {options.map(option => (
                            <th key={option.value} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {option.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {evaluationData.map(item => (
                          <tr key={item.field}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.critere}
                            </td>
                            {options.map(option => (
                              <td key={option.value} className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="radio"
                                  name={`${participant.id_participant}_${item.field}`}
                                  checked={evaluations[participant.id_participant]?.[item.field] === option.value}
                                  onChange={() => handleEvaluationChange(participant.id_participant, item.field, option.value)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Observations à la fin de chaque participant */}
                  <div className="mt-4">
                    <h4 className="text-md font-medium text-gray-700 mb-2">Observations générales</h4>
                    <TextArea
                      rows={4}
                      className="w-full"
                      value={evaluations[participant.id_participant]?.observation || ''}
                      onChange={(e) => handleEvaluationChange(participant.id_participant, 'observation', e.target.value)}
                      placeholder="Ajoutez vos observations sur ce participant..."
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                Aucun participant trouvé pour cette formation
              </div>
            )}

            {participants.length > 0 && (
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`px-4 py-2 rounded-md text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer les évaluations'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AvisFormateur;   