import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Si vous utilisez react-router pour la navigation
import Calendrier from './Calendrier';
import DemandeModification from './DemandeModification';
import FormationARealise from './FormationARealise';
import HistoriqueFormation from './HistoriqueFormation';
import { useAuth } from '../Hooks/useAuthUser';
const ProfilFormateur: React.FC = () => {
  const [activeContent, setActiveContent] = useState<string>('');
  const [formateur, setFormateur] = useState<any>(null); 
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem('token'); 

      if (!token) {
        navigate('/'); 
        return;
      }
      fetchFormateurDetails();
    };

    const fetchFormateurDetails = async () => {
      try {
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
    
        setFormateur(response.data); 
      } catch (error) {
        console.error("Erreur lors de la récupération des détails du formateur :", error);
      }
    };
    

    checkAuthentication();
  }, [navigate]);

  const handleButtonClick = (content: string) => {
    setActiveContent(content); 
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      if (!userData.id) {
        console.error("ID formateur non trouvé !");
        return;
      }

      const response = await axios.put(
        `${import.meta.env.VITE_APP_API_URL}/apiUser/formateur/details/${userData.id}`,
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
    return <div>Chargement...</div>; 
  }

  return (
    <div className="max-w-6xl mx-auto pt-5 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-semibold text-center text-teal-500 mb-4">
         {formateur.nom_complet} 
      </h1><br/>

      <div className="space-y-4">
        <div className="text-1xl text-gray-600 font-semibold">

        <div className="mt-6 text-right">
  <button
    onClick={() => handleButtonClick('demandeModification')}
    className="mt-0 px-6 py-3 bg-white text-teal-500 rounded hover:bg-teal-600 border border-teal-500 hover:text-white transition"
  >
    modifier mon profil ✏️
  </button>
  {activeContent === 'demandeModification' && (
    <DemandeModification onClose={() => handleButtonClick('')} />
  )}
</div><br/>
          {/*<h2 className="text-1xl font-semibold">Nom Complet : {formateur.nom_complet}</h2>*/}
          <div className='flex space-x-4'>
          
  <div className='backdrop-blur-sm bg-black/5 p-6 rounded-lg leading-relaxed flex-1'>
    <p className="text-1xl font-semibold">Téléphone: {formateur.tel}</p>
    <p>Email: {formateur.mail}</p>
    <p>Adresse: {formateur.adr || ""}</p>
  </div>

  <div className='backdrop-blur-sm bg-black/5 p-6 rounded-lg leading-relaxed flex-1'>
    <p>Banque : {formateur.nom_banque || ""}</p>
    <p>RIB : {formateur.RIB || ""}</p>
  </div>
</div>
<br/>
          <div className='backdrop-blur-sm bg-black/5 p-6 rounded-lg leading-relaxed'>

          <p>Domaines de compétences: {formateur.domaine_de_competences || ""}</p>
          <p>Domaines de compétences au niveau d'assistance: {formateur.domaine_assistance || ""}</p>
          <p>Thèmes à enseigner: {formateur.themes_a_enseigner || ""}</p>
          <p>Nombre des formations: {formateur.nb_formations || ""}</p>
          <p>Nombre d'années d'experience : {formateur.nb_experience || ""}</p>
          </div>
        
         
        </div>
        <div className='backdrop-blur-sm bg-black/5 p-6 rounded-lg leading-relaxed'>

      
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

</div>
        {/* Section de modification de mot de passe */}
        <div className='backdrop-blur-sm bg-black/5 p-6 rounded-lg leading-relaxed flex-1'>

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

        <div className='backdrop-blur-sm bg-black/5 p-6 rounded-lg leading-relaxed flex-1'>
        <h2 className="text-xl font-semibold">Consultez vos sessions</h2>

        <div className="flex flex-row justify-center gap-4 mt-4">
  <button
    onClick={() => handleButtonClick('formationsARealise')}
    className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition"
  >
    Formations A Réalisé
  </button>
  
  <button
    onClick={() => handleButtonClick('historiqueFormations')}
    className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition"
  >
    Historique Formations
  </button>
</div></div>

{activeContent === 'formationsARealise' && <FormationARealise />}
{activeContent === 'historiqueFormations' && <HistoriqueFormation />}

        <div className="center my-4">
          <Calendrier />
        </div>

        
      </div>
    </div>
  );
};

export default ProfilFormateur;
