import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Calendrier from './Calendrier';
import DemandeModification from './DemandeModification';
import FormationARealise from './FormationARealise';
import HistoriqueFormation from './HistoriqueFormation';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';

interface Formateur {
  id_formateur: number;
  nom_complet: string;
  mail: string;
  adr?: string;
  domaine_de_competences?: string;
  tarif_journalier?: number;
  nb_formations?: number;
  tel?: string;
  cv?: string;
  niveau_etude?: string;
  nb_experience?: number;
  horraire_jour?: string;
  nom_banque?: string;
  RIB?: string;
  domaine_assistance?: string;
  retour_sacConsulting?: string;
  CIN?: string;
  themes_a_enseigner: string[] | string;
  fichePrg?: Array<{ chemin: string }>;
  coursSession?: Array<{ chemin: string }>;
}

const ProfilFormateur: React.FC = () => {
  const [activeContent, setActiveContent] = useState<string>('');
  const [formateur, setFormateur] = useState<Formateur | null>(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fonction pour transformer les thèmes en tableau
  const getThemesArray = (): string[] => {
    if (!formateur?.themes_a_enseigner) return [];
    
    try {
      if (Array.isArray(formateur.themes_a_enseigner)) {
        return formateur.themes_a_enseigner;
      }
      
      if (typeof formateur.themes_a_enseigner === 'string') {
        return JSON.parse(formateur.themes_a_enseigner);
      }
      
      return [];
    } catch (error) {
      console.error("Erreur de parsing des thèmes:", error);
      return [];
    }
  };

  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem('user'); 
      if (!token) {
        navigate('/'); 
        return;
      }
      fetchFormateurDetails();
    };

    const fetchFormateurDetails = async () => {
      try {
        setLoading(true);
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        if (!userData.id || !userData.token) {
          console.error("❌ ID formateur ou token non trouvés !");
          return;
        }
    
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/apiUser/formateur/details/${userData.id}`, { 
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        });
    
        // Transformation robuste des données
        const transformedData: Formateur = {
          ...response.data,
          themes_a_enseigner: getThemesArray(),
          fichePrg: Array.isArray(response.data.fichePrg) 
            ? response.data.fichePrg.filter((f: any) => f?.chemin)
            : [],
          coursSession: Array.isArray(response.data.coursSession)
            ? response.data.coursSession.filter((c: any) => c?.chemin)
            : []
        };
    
        setFormateur(transformedData);
      } catch (error) {
        console.error("Erreur lors de la récupération des détails du formateur:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, [navigate]);

  const handleButtonClick = (content: string) => {
    setActiveContent(content); 
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    setIsUpdating(true);

    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      
      if (!userData.id || !userData.token) {
        throw new Error("Session invalide - Veuillez vous reconnecter");
      }

      if (newPassword.length < 8) {
        throw new Error("Le mot de passe doit contenir au moins 8 caractères");
      }

      const response = await axios.put(
        `${import.meta.env.VITE_APP_API_URL}/apiUser/formateur/details/${userData.id}`,
        {
          oldPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Échec de la mise à jour");
      }

      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert("Mot de passe mis à jour avec succès");

    } catch (error: any) {
      console.error('Erreur complète:', error);
      
      if (error.code === 'ECONNABORTED') {
        setPasswordError("Timeout - Le serveur ne répond pas");
      } else if (error.response) {
        setPasswordError(error.response.data?.message || "Erreur serveur");
      } else {
        setPasswordError(error.message || "Erreur inconnue");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!formateur) {
    return <div className="text-center p-8">Aucune donnée de formateur disponible</div>;
  }

  return (
    <div className="max-w-6xl mx-auto pt-5 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-semibold text-center text-teal-500 mb-4">
        {formateur.nom_complet} 
      </h1>

      <div className="space-y-6">
        <div className="text-right">
          <button
            onClick={() => handleButtonClick('demandeModification')}
            className="mt-0 px-6 py-3 bg-white text-teal-500 rounded hover:bg-teal-600 border border-teal-500 hover:text-white transition"
          >
            modifier mon profil ✏️
          </button>
          {activeContent === 'demandeModification' && (
            <ErrorBoundary>
              <DemandeModification onClose={() => handleButtonClick('')} />
            </ErrorBoundary>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Informations Personnelles</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Téléphone:</span> {formateur.tel || "Non spécifié"}</p>
              <p><span className="font-medium">Email:</span> {formateur.mail}</p>
              <p><span className="font-medium">Adresse:</span> {formateur.adr || "Non spécifié"}</p>
              <p><span className="font-medium">CIN:</span> {formateur.CIN || "Non spécifié"}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Informations Bancaires</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Banque:</span> {formateur.nom_banque || "Non spécifié"}</p>
              <p><span className="font-medium">RIB:</span> {formateur.RIB ? "•••• •••• •••• ••••" : "Non spécifié"}</p>
              {formateur.tarif_journalier && (
                <p><span className="font-medium">Tarif journalier:</span> {formateur.tarif_journalier} MAD</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Compétences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><span className="font-medium">Domaines de compétences:</span> {formateur.domaine_de_competences || "Non spécifié"}</p>
              <p><span className="font-medium">Domaines d'assistance:</span> {formateur.domaine_assistance || "Non spécifié"}</p>
            </div>
            <div>
              <p><span className="font-medium">Thèmes à enseigner:</span> {getThemesArray().join(", ") || "Aucun thème spécifié"}</p>
              <p><span className="font-medium">Années d'expérience:</span> {formateur.nb_experience || "0"}</p>
            </div>
          </div>
        </div>

        {formateur.cv && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">CV</h2>
            <a 
              href={`${import.meta.env.VITE_APP_API_URL}/uploads/${formateur.cv}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-teal-500 hover:underline inline-flex items-center"
            >
              Télécharger le CV
              <span className="ml-2 text-xs text-gray-500">
                ({(formateur.cv.split('.').pop() || '').toUpperCase()})
              </span>
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Fiches Programme</h2>
            {formateur.fichePrg && formateur.fichePrg.length > 0 ? (
              <ul className="space-y-2">
                {formateur.fichePrg.map((fiche, index) => (
                  <li key={index}>
                    <a
                      href={`${import.meta.env.VITE_APP_API_URL}/uploads/${fiche.chemin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-500 hover:underline"
                    >
                      Fiche programme {index + 1}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Aucune fiche programme disponible</p>
            )}
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Sessions de Cours</h2>
            {formateur.coursSession && formateur.coursSession.length > 0 ? (
              <ul className="space-y-2">
                {formateur.coursSession.map((cours, index) => (
                  <li key={index}>
                    <a
                      href={`${import.meta.env.VITE_APP_API_URL}/uploads/${cours.chemin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-500 hover:underline"
                    >
                      Session {index + 1}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Aucune session de cours disponible</p>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Modifier le mot de passe</h2>
          <div className="max-w-md space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mot de passe actuel</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nouveau mot de passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
            <button
              onClick={handlePasswordChange}
              disabled={isUpdating}
              className={`px-4 py-2 rounded text-white ${
                isUpdating ? 'bg-gray-400' : 'bg-teal-500 hover:bg-teal-600'
              }`}
            >
              {isUpdating ? 'En cours...' : 'Mettre à jour'}
            </button>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Sessions</h2>
          <div className="flex gap-4">
            <button
              onClick={() => handleButtonClick('formationsARealise')}
              className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition"
            >
              Formations réalisées
            </button>
            <button
              onClick={() => handleButtonClick('historiqueFormations')}
              className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition"
            >
              Historique des formations
            </button>
          </div>
          
          <div className="mt-4">
            {activeContent === 'formationsARealise' && <FormationARealise />}
            {activeContent === 'historiqueFormations' && <HistoriqueFormation />}
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <ErrorBoundary>
            <Calendrier />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default ProfilFormateur;