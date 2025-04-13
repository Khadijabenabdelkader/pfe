import React from 'react';

const getSatisfactionLabel = (value: number): string => {
  switch (value) {
    case 1:
      return "Insuffisant";
    case 2:
      return "Passable";
    case 3:
      return "Assez bien";
    case 4:
      return "Bien";
    case 5:
      return "Très bien";
    default:
      return "❓ Non évalué";
  }
};

const AvisFormateur = ({
  avisList,
  loading,
  error,
  onClose,
}: {
  avisList: any[]; 
  loading: boolean;
  error: string | null; 
  onClose: () => void; 
}) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full overflow-y-auto max-h-[90vh]">
        <h2 className="text-lg font-semibold mb-4 text-center">Avis sur les participants</h2>

        {loading && <p className="text-center text-gray-600">Chargement des avis...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {avisList.length > 0 ? (
          avisList.map((avis) => (
            <div key={avis.id_avis} className="mb-6">
              <table className="w-full border-collapse border border-gray-300">
                <tbody>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 px-4 py-2 text-left w-1/3">📅 Date</th>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(avis.date_creation).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">👤 Formateur</th>
                    <td className="border border-gray-300 px-4 py-2">{avis.nom_formateur}</td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">👤 Participant</th>
                    <td className="border border-gray-300 px-4 py-2">{avis.nom_participant}</td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">💬 Observation et suggestions</th>
                    <td className="border border-gray-300 px-4 py-2">
                      {avis.observation || "Aucun commentaire"}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">📌 Connaissances professionnelles</th>
                    <td className="border border-gray-300 px-4 py-2">
                      {getSatisfactionLabel(avis.connaissances_professionnelles)}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">📌 Connaissances des équipements</th>
                    <td className="border border-gray-300 px-4 py-2">
                      {getSatisfactionLabel(avis.connaissances_equipements)}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">📌 Compréhension des compétences</th>
                    <td className="border border-gray-300 px-4 py-2">
                      {getSatisfactionLabel(avis.comprehension_competences)}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">📌 Aptitude à appliquer les informations</th>
                    <td className="border border-gray-300 px-4 py-2">
                      {getSatisfactionLabel(avis.aptitude_appliquer_infos)}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">📌 Rapidité d'exécution</th>
                    <td className="border border-gray-300 px-4 py-2">
                      {getSatisfactionLabel(avis.rapidite_execution)}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">📌 Qualité des travaux</th>
                    <td className="border border-gray-300 px-4 py-2">
                      {getSatisfactionLabel(avis.qualite_travaux)}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">📌 Clarté et pertinence des résultats</th>
                    <td className="border border-gray-300 px-4 py-2">
                      {getSatisfactionLabel(avis.clarte_pertinence_resultats)}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">📌 Perfectionnement des connaissances</th>
                    <td className="border border-gray-300 px-4 py-2">
                      {getSatisfactionLabel(avis.perfectionnement_connaissances)}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">📌 Respect des consignes du constructeur</th>
                    <td className="border border-gray-300 px-4 py-2">
                      {getSatisfactionLabel(avis.respect_consignes_constructeur)}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">📌 Respect des normes de sécurité</th>
                    <td className="border border-gray-300 px-4 py-2">
                      {getSatisfactionLabel(avis.respect_normes_securite)}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">📌 Autonomie dans le travail</th>
                    <td className="border border-gray-300 px-4 py-2">
                      {getSatisfactionLabel(avis.autonomie_travail)}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">📌 Participation</th>
                    <td className="border border-gray-300 px-4 py-2">
                      {getSatisfactionLabel(avis.participation)}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">📌 Assiduité et ponctualité</th>
                    <td className="border border-gray-300 px-4 py-2">
                      {getSatisfactionLabel(avis.assiduite_ponctualite)}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">📌 Initiative</th>
                    <td className="border border-gray-300 px-4 py-2">
                      {getSatisfactionLabel(avis.initiative)}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">📌 Esprit de groupe</th>
                    <td className="border border-gray-300 px-4 py-2">
                      {getSatisfactionLabel(avis.esprit_groupe)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600">Aucun avis disponible.</p>
        )}

        {/* Bouton pour fermer la fenêtre */}
        <div className="flex justify-center mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvisFormateur;