import React from 'react';

interface AvisData {
  id_presence: number;
  nom_formateur: string;
  nom_complet: string;
  connaissances_professionnelles: string;
  connaissances_equipements: string;
  comprehension_competences: string;
  aptitude_appliquer_infos: string;
  rapidite_execution: string;
  qualite_travaux: string;
  clarte_pertinence_resultats: string;
  perfectionnement_connaissances: string;
  respect_consignes_constructeur: string;
  respect_normes_securite: string;
  autonomie_travail: string;
  participation: string;
  initiative: string;
  esprit_groupe: string;
  observation: string;
}

interface AvisFormateurProps {
  avisList: AvisData[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

const AvisFormateur: React.FC<AvisFormateurProps> = ({
  avisList,
  loading,
  error,
  onClose,
}) => {
  // Liste des critères d'évaluation avec leurs libellés
  const criteres = [
    { key: 'connaissances_professionnelles', label: 'Connaissances professionnelles' },
    { key: 'connaissances_equipements', label: 'Connaissances des équipements' },
    { key: 'comprehension_competences', label: 'Compréhension des compétences' },
    { key: 'aptitude_appliquer_infos', label: 'Aptitude à appliquer les infos' },
    { key: 'rapidite_execution', label: 'Rapidité d\'exécution' },
    { key: 'qualite_travaux', label: 'Qualité des travaux' },
    { key: 'clarte_pertinence_resultats', label: 'Clarté et pertinence des résultats' },
    { key: 'perfectionnement_connaissances', label: 'Perfectionnement des connaissances' },
    { key: 'respect_consignes_constructeur', label: 'Respect des consignes du constructeur' },
    { key: 'respect_normes_securite', label: 'Respect des normes de sécurité' },
    { key: 'autonomie_travail', label: 'Autonomie dans le travail' },
    { key: 'participation', label: 'Participation' },
    { key: 'initiative', label: 'Initiative' },
    { key: 'esprit_groupe', label: 'Esprit de groupe' },
  ];

  return (
    <>
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-gray-800">Avis du Formateur sur les Participants</h2>
    </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {avisList.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucun avis disponible pour cette session.
              </div>
            ) : (
              <div className="space-y-6">
                {avisList.map((avis, index) => (
                  <div key={`${avis.id_presence}-${index}`} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-3 border-b">
                      <h3 className="font-semibold text-gray-800">
                        Évaluation pour <span className="text-blue-600">{avis.nom_complet}</span>
                      </h3>
                      <p className="text-sm text-gray-600">
                        Formateur: <span className="font-medium">{avis.nom_formateur}</span>
                      </p>
                    </div>

                    <div className="p-4">
                      {avis.observation && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-700 mb-2">📝 Observation générale</h4>
                          <p className="bg-gray-50 p-3 rounded">{avis.observation}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {criteres.map((critere) => (
                          <div key={critere.key} className="border rounded p-3">
                            <h4 className="font-medium text-gray-700 mb-1">{critere.label}</h4>
                            <p className="text-gray-900">
                              {avis[critere.key as keyof AvisData] || 'Non évalué'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        <div className="flex justify-center mt-6">
    <button
    onClick={onClose}
    className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
    aria-label="Fermer"
  >
    Ferme
  </button>
  </div>
      </div>     
    </div>
    
  </>
  );
};

export default AvisFormateur;