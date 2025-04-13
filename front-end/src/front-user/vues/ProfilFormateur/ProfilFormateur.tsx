import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Si vous utilisez react-router pour la navigation
import Calendrier from './Calendrier';
import DemandeModification from './DemandeModification';
import FormationARealise from './FormationARealise';
import HistoriqueFormation from './HistoriqueFormation';

const ProfilFormateur: React.FC = () => {
  const [activeContent, setActiveContent] = useState<string>(''); // Gérer le contenu affiché
  const [formateur, setFormateur] = useState<any>(null); 
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fonction pour vérifier si l'utilisateur est authentifié
    const checkAuthentication = () => {
      const token = localStorage.getItem('token'); // ou sessionStorage ou cookies, selon votre choix

      if (!token) {
        navigate('/'); // Redirige vers la page de login si l'utilisateur n'est pas connecté
        return;
      }

      // Si un token existe, récupérer les données du formateur à partir de l'API
      fetchFormateurDetails();
    };

    // Récupérer les informations du formateur depuis l'API
    const fetchFormateurDetails = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        if (!userData.id_formateur || !userData.token) {
          console.error("❌ ID formateur ou token non trouvés !");
          return;
        }
    
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/apiUser/formateur/details/${userData.id_formateur}`, { 
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        });
    
        setFormateur(response.data);  // Mettre à jour les informations du formateur
      } catch (error) {
        console.error("Erreur lors de la récupération des détails du formateur :", error);
      }
    };
    

    checkAuthentication(); // Vérifie si l'utilisateur est connecté et récupère ses détails
  }, [navigate]);

  const handleButtonClick = (content: string) => {
    setActiveContent(content); // Définir le contenu actif en fonction du bouton cliqué
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      if (!userData.id_formateur) {
        console.error("ID formateur non trouvé !");
        return;
      }

      const response = await axios.put(
        `${import.meta.env.VITE_APP_API_URL}/apiUser/formateur/details/${userData.id_formateur}`,
        {
          old_password: oldPassword,
          new_password: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        }
      );

      alert(response.data.message);  // Afficher un message de succès
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      setPasswordError('Une erreur est survenue lors de la mise à jour du mot de passe.');
    }
  };

  if (!formateur) {
    return <div>Chargement...</div>; // Affiche un message de chargement si les données sont en attente
  }

  return (
    <div className="max-w-4xl mx-auto pt-36 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center text-teal-600 mb-4">
        Bienvenue dans Sac_Consulting
      </h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Nom Complet: {formateur.nom_complet}</h2>
          <p><strong>Téléphone:</strong> {formateur.tel}</p>
          <p><strong>Email:</strong> {formateur.mail}</p>
          <p><strong>Adresse:</strong> {formateur.adr || ""}</p>
          <p><strong>Domaine de Compétences:</strong> {formateur.domaine_de_competences || ""}</p>
          <p><strong>Domaine de Compétences au niveau d'assistance:</strong> {formateur.domaine_assistance || ""}</p>
          <p><strong>Thèmes à enseigner:</strong> {formateur.themes_a_enseigner || ""}</p>
          <p><strong>Nombre de Formations:</strong> {formateur.nb_formations || ""}</p>
          <p><strong>Nombre d'années d'experience :</strong> {formateur.nb_experience || ""}</p>
          <p><strong>Nom du Banque :</strong> {formateur.nom_banque || ""}</p>
          <p><strong>RIB Banque:</strong> {formateur.RIB || ""}</p>

        </div>

        {/* 🔹 CV PDF */}
        {formateur.cv && (
          <div>
            <h2 className="text-lg font-semibold">CV :</h2>
            <a 
                    href={`${import.meta.env.VITE_APP_API_URL}/uploads/${formateur.cv}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-teal-500 hover:underline"
                  >
              Voir le CV
            </a>
          </div>
        )}

        {/* 🔹 Fiches Programme PDF */}
        {formateur.fichePrg && formateur.fichePrg.length > 0 ? (
          <div>
            <h2 className="text-lg font-semibold">Fiches Programme :</h2>
            <ul>
              {formateur.fichePrg.map((fiche: any, index: number) => (
                <li key={index}>
                  <a
                    href={`${import.meta.env.VITE_APP_API_URL}/uploads/${fiche.chemin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-500 underline"
                  >
                    Voir la fiche {index + 1}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>Aucune fiche programme disponible.</p>
        )}

{formateur.coursSession && formateur.coursSession.length > 0 ? (
  <div>
    <h2 className="text-lg font-semibold">Sessions de Cours :</h2>
    <ul>
      {formateur.coursSession.map((cours: any, index: number) => (
        <li key={index}>
          <a
            href={`${import.meta.env.VITE_APP_API_URL}/uploads/${cours.chemin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-500 underline"
          >
            Voir la fiche {index + 1}
          </a>
        </li>
      ))}
    </ul>
  </div>
) : (
  <p>Aucune cours disponible.</p>
)}


        {/* Section de modification de mot de passe */}
        <div>
          <h2 className="text-xl font-semibold">Modifier votre mot de passe</h2>
          <div className="mt-4">
            <input
              type="password"
              placeholder="Mot de passe actuel"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="border p-2 rounded w-full mb-2"
            />
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border p-2 rounded w-full mb-2"
            />
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border p-2 rounded w-full mb-2"
            />
            {passwordError && <p className="text-red-500">{passwordError}</p>}
            <button
              onClick={handlePasswordChange}
              className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
            >
              Modifier le mot de passe
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={() => handleButtonClick('formationsARealise')}
            className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition"
          >
            Formations A Réalisé
          </button>
          {activeContent === 'formationsARealise' && (<FormationARealise />)}

          <button
            onClick={() => handleButtonClick('historiqueFormations')}
            className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition"
          >
            Historique Formations
          </button>
          {activeContent === 'historiqueFormations' && (<HistoriqueFormation />)}
        </div>

        <div className="center my-4">
          <Calendrier />
        </div>

        <div className="mt-6 text-center">
          <h3 className="text-lg font-semibold">
            En cas de modifications de vos données, veuillez cliquer ici:
          </h3>
          <button
            onClick={() => handleButtonClick('demandeModification')}
            className="mt-4 px-6 py-3 bg-gray-800 text-white rounded hover:bg-gray-600 transition"
          >
            Demander de modification
          </button>
          {activeContent === 'demandeModification' && <DemandeModification />}
        </div>
      </div>
    </div>
  );
};

export default ProfilFormateur;
