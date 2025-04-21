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
      <div className="max-w-6xl mx-auto p-6 bg-white border rounded-lg shadow-md overflow-x-auto">
        <h2 className="text-xl text-teal-500 font-semibold mb-4 text-center">Liste des demandes de formation</h2>
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
  
        <div className="flex justify-end mb-4">
          <button
            className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
            onClick={handleToggleArchived}
          >
            {showArchived ? 'Masquer les demandes archivées' : 'Voir les demandes archivées'}
          </button>
        </div>
  
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 border text-left text-sm font-medium text-gray-500">Domaine</th>
                <th className="px-4 py-2 border text-left text-sm font-medium text-gray-500">Thème</th>
                <th className="px-4 py-2 border text-left text-sm font-medium text-gray-500">Formateur</th>
                <th className="px-4 py-2 border text-left text-sm font-medium text-gray-500">Niveau</th>
                <th className="px-4 py-2 border text-left text-sm font-medium text-gray-500">Participants</th>
                <th className="px-4 py-2 border text-left text-sm font-medium text-gray-500">Demandeur</th>
                <th className="px-4 py-2 border text-left text-sm font-medium text-gray-500">Email</th>
                <th className="px-4 py-2 border text-left text-sm font-medium text-gray-500">Téléphone</th>
                <th className="px-4 py-2 border text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {showArchived ? (
                archivedDemandes.length > 0 ? (
                  archivedDemandes.map((demande) => (
                    <tr key={demande.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border text-sm text-gray-900">{demande.domaine}</td>
                      <td className="px-4 py-2 border text-sm text-gray-900">{demande.theme}</td>
                      <td className="px-4 py-2 border text-sm text-gray-900">{demande.formateur}</td>
                      <td className="px-4 py-2 border text-sm text-gray-900">{demande.niveau}</td>
                      <td className="px-4 py-2 border text-sm text-gray-900">{demande.nombreParticipants}</td>
                      <td className="px-4 py-2 border text-sm text-gray-900">{demande.quiDemande}</td>
                      <td className="px-4 py-2 border text-sm text-gray-900">{demande.contactMail}</td>
                      <td className="px-4 py-2 border text-sm text-gray-900">{demande.contactTel}</td>
                      <td className="px-4 py-2 border text-sm text-gray-500">Archivée</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-4 border text-center text-sm text-gray-500">
                      Aucune demande archivée
                    </td>
                  </tr>
                )
              ) : (
                demandes.length > 0 ? (
                  demandes.map((demande) => (
                    <tr key={demande.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border text-sm text-gray-900">{demande.domaine}</td>
                      <td className="px-4 py-2 border text-sm text-gray-900">{demande.theme}</td>
                      <td className="px-4 py-2 border text-sm text-gray-900">{demande.formateur}</td>
                      <td className="px-4 py-2 border text-sm text-gray-900">{demande.niveau}</td>
                      <td className="px-4 py-2 border text-sm text-gray-900">{demande.nombreParticipants}</td>
                      <td className="px-4 py-2 border text-sm text-gray-900">{demande.quiDemande}</td>
                      <td className="px-4 py-2 border text-sm text-gray-900">{demande.contactMail}</td>
                      <td className="px-4 py-2 border text-sm text-gray-900">{demande.contactTel}</td>
                      <td className="px-4 py-2 border">
                        <button
                          className="px-3 py-1 bg-teal-500 text-white rounded hover:bg-teal-600 text-sm"
                          onClick={() => handleArchiver(demande.id)}
                        >
                          Archiver
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-4 border text-center text-sm text-gray-500">
                      Aucune demande trouvée
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default DemandesDeFormation;