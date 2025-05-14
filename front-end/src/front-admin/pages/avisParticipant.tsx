import React from 'react';

// Fonction pour formater les valeurs textuelles
const formatAvisValue = (value: string): string => {
  if (!value) return "Non spécifié";
  // Capitalize first letter
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

const Avis = ({
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
    <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4 text-center text-teal-700">Avis des Participants</h2>

        {loading && <p className="text-center text-gray-600">Chargement des avis...</p>}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {avisList.length > 0 ? (
          <div className="space-y-6">
            {avisList.map((avis) => (
              <div key={avis.id_avis} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="font-semibold">📅 Date:</p>
                    <p>{new Date(avis.date_creation).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div>
                    <p className="font-semibold">👤 Participant:</p>
                    <p>{avis.nom_complet }</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="font-semibold">💬 Commentaire:</p>
                  <p className="bg-gray-50 p-3 rounded mt-1">
                    {avis.commentaire || "Aucun commentaire"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">📌 Adaptation du programme:</p>
                    <p>{formatAvisValue(avis.adaptation_programme_vie_pro)}</p>
                  </div>
                  <div>
                    <p className="font-semibold">📌 Moyens pédagogiques:</p>
                    <p>{formatAvisValue(avis.moyens_pedagogiques_utilises)}</p>
                  </div>
                  <div>
                    <p className="font-semibold">📌 Horaires de formation:</p>
                    <p>{formatAvisValue(avis.convenance_horaires_formation)}</p>
                  </div>
                  <div>
                    <p className="font-semibold">📌 Apports professionnels:</p>
                    <p>{formatAvisValue(avis.apports_niveau_professionnel)}</p>
                  </div>
                  <div>
                    <p className="font-semibold">📌 Documentation:</p>
                    <p>{formatAvisValue(avis.qualite_documentation_distribuee)}</p>
                  </div>
                  <div>
                    <p className="font-semibold">📌 Maîtrise des sujets:</p>
                    <p>{formatAvisValue(avis.maitrise_globale_sujets_presentes)}</p>
                  </div>
                  <div>
                    <p className="font-semibold">📌 Exemples pratiques:</p>
                    <p>{formatAvisValue(avis.traitement_exemples_travail)}</p>
                  </div>
                  <div>
                    <p className="font-semibold">📌 Animation des séances:</p>
                    <p>{formatAvisValue(avis.animations_seances)}</p>
                  </div>
                  <div>
                    <p className="font-semibold">📌 Homogénéité du groupe:</p>
                    <p>{formatAvisValue(avis.homogeneite_groupe)}</p>
                  </div>
                  <div>
                    <p className="font-semibold">📌 Satisfaction globale:</p>
                    <p>{formatAvisValue(avis.satisfaction_attentes)}</p>
                  </div>
                  <div>
                    <p className="font-semibold">📌 Durée de formation:</p>
                    <p>{formatAvisValue(avis.duree_formation)}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="font-semibold">⭐ Note globale:</p>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-2xl ${i < avis.note ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="ml-2">({avis.note}/5)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun avis disponible pour cette session</p>
            </div>
          )
        )}

        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default Avis;