import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

interface Session {
  id_session: number;
  theme: string;
  code: string;
  domaine: string;
  duree: number;
  date_debut: string;
  date_fin: Date;
  etat: string;
  type_session: string;
  fiche_prg: string;
 
}

const HistoriqueFormation: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        console.log("Données utilisateur récupérées :", userData); // 🔍 Debugging
  
        if (!userData.id_formateur) {
          console.error("❌ ID formateur non trouvé !");
          return;
        }
  

    axios.get(`${import.meta.env.VITE_APP_API_URL}/apiUser/historique-formations/${userData.id_formateur}`)
      .then(response => {
        if (Array.isArray(response.data)) {
          setSessions(response.data);
        } else {
          throw new Error("La réponse de l'API n'est pas un tableau.");
        }
      })
      .catch(error => {
        console.error('Erreur lors de la récupération de l\'historique des formations :', error);
        setError('Erreur lors de la récupération des données.');
      })
      .finally(() => setLoading(false));
  }, []); 

  if (loading) return <p>Chargement des formations...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
<div className="max-w-6xl mx-auto p-5 bg-white shadow-8 rounded-lg">
<h1 className="text-1xl font-semibold text-gray-600 mb-4">Formations déjà Réalisées</h1>
      {sessions.length > 0 ? (
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">Thème</th>
              <th className="border border-gray-300 px-4 py-2">Code</th>
              <th className="border border-gray-300 px-4 py-2">Domaine</th>
              <th className="border border-gray-300 px-4 py-2">Durée</th>
              <th className="border border-gray-300 px-4 py-2">Date Début</th>
              <th className="border border-gray-300 px-4 py-2">Date Fin</th>
              <th className="border border-gray-300 px-4 py-2">État</th>
              <th className="border border-gray-300 px-4 py-2">Type de Session</th>
              <th className="border border-gray-300 px-4 py-2">Fiche Programme</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id_session} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">{session.theme}</td>
                <td className="border border-gray-300 px-4 py-2">{session.code}</td>
                <td className="border border-gray-300 px-4 py-2">{session.domaine}</td>
                <td className="border border-gray-300 px-4 py-2">{session.duree} jours</td>
                <td className="border border-gray-300 px-4 py-2">{new Date(session.date_debut).toLocaleDateString()}</td>
                <td className="border border-gray-300 px-4 py-2">{new Date(session.date_fin).toLocaleDateString()}</td>
                <td className="border border-gray-300 px-4 py-2">{session.etat}</td>
                <td className="border border-gray-300 px-4 py-2">{session.type_session}</td>
                <td className="border border-gray-300 px-4 py-2">
                <a 
                    href={`${import.meta.env.VITE_APP_API_URL}/uploads/${session.fiche_prg}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-teal-500 hover:underline"
                  >
                    Voir la fiche
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center text-gray-500">Aucune session à réaliser pour le moment.</div>
      )}
    </div>
  );
};

export default HistoriqueFormation;
