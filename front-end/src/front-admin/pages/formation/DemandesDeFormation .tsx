import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const DemandesDeFormation = () => {
  const [demandes, setDemandes] = useState<any[]>([]);
  const [archivedDemandes, setArchivedDemandes] = useState<any[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchDemandes = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/demanderFormation`);
        setDemandes(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des demandes:', error);
        setError('Une erreur est survenue lors du chargement des demandes.');
      }
    };

    fetchDemandes();
  }, []);

  const handleArchiver = (id: number) => {
    const demandeToArchive = demandes.find((demande) => demande.id === id);
    if (demandeToArchive && !archivedDemandes.some((d) => d.id === id)) {
      setArchivedDemandes((prev) => [...prev, demandeToArchive]);
      setDemandes((prevDemandes) => prevDemandes.filter((demande) => demande.id !== id));
    }
  };

  const handleToggleArchived = () => {
    setShowArchived((prev) => !prev);
  };

  return (
    <>
          <Breadcrumb pageName="Demander de formations" />

    <div className="max-w-6xl mx-auto p-6 bg-white border rounded-lg shadow-md">
      <h2 className="text-xl text-teal-500 font-semibold mb-4">Liste des demandes de formation</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
          onClick={handleToggleArchived}
        >
          {showArchived ? 'Masquer les demandes archivées' : 'Voir les demandes archivées'}
        </button>
      </div>

      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Domaine</th>
            <th className="px-4 py-2 border">Thème</th>
            <th className="px-4 py-2 border">Formateur</th>
            <th className="px-4 py-2 border">Niveau</th>
            <th className="px-4 py-2 border">Nombre de Participants</th>
            <th className="px-4 py-2 border">Qui Demande</th>
            <th className="px-4 py-2 border">Contact Email</th>
            <th className="px-4 py-2 border">Contact Téléphone</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {showArchived ? (
            archivedDemandes.length > 0 ? (
              archivedDemandes.map((demande) => (
                <tr key={demande.id}>
                  <td className="px-4 py-2 border">{demande.domaine}</td>
                  <td className="px-4 py-2 border">{demande.theme}</td>
                  <td className="px-4 py-2 border">{demande.formateur}</td>
                  <td className="px-4 py-2 border">{demande.niveau}</td>
                  <td className="px-4 py-2 border">{demande.nombreParticipants}</td>
                  <td className="px-4 py-2 border">{demande.quiDemande}</td>
                  <td className="px-4 py-2 border">{demande.contactMail}</td>
                  <td className="px-4 py-2 border">{demande.contactTel}</td>
                  <td className="px-4 py-2 border text-gray-500">Archivée</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-2 border text-center">
                  Aucune demande archivée
                </td>
              </tr>
            )
          ) : (
            demandes.length > 0 ? (
              demandes.map((demande) => (
                <tr key={demande.id}>
                  <td className="px-4 py-2 border">{demande.domaine}</td>
                  <td className="px-4 py-2 border">{demande.theme}</td>
                  <td className="px-4 py-2 border">{demande.formateur}</td>
                  <td className="px-4 py-2 border">{demande.niveau}</td>
                  <td className="px-4 py-2 border">{demande.nombreParticipants}</td>
                  <td className="px-4 py-2 border">{demande.quiDemande}</td>
                  <td className="px-4 py-2 border">{demande.contactMail}</td>
                  <td className="px-4 py-2 border">{demande.contactTel}</td>
                  <td className="px-4 py-2 border">
                    <button
                      className="px-2 py-1 bg-teal-500 text-white rounded hover:bg-teal-600"
                      onClick={() => handleArchiver(demande.id)}
                    >
                      Archiver
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-2 border text-center">
                  Aucune demande trouvée
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
    </>

  );
};

export default DemandesDeFormation;