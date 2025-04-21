import axios from 'axios';
import React, { useState, useEffect } from 'react';

interface Theme {
  id: number;
  theme: string;
  formateur: string;
  date_debut: string;
  date_fin: string;
  domaine: string;
  nbj: number;
}

interface Participant {
  id: number;
  nomPrenom: string;
  CIN: number;
  directionService: string;
  entreprise: string;
  emargements: Record<string, string>;
  mail?: string;
  telephone?: string;
  nature_participant?: string;
  matricule?: string;
  adr_entreprise?: string;
  email_entreprise?: string;
  tel_entreprise?: string;
  adresse?: string;
}

interface Formateur {
  nomPrenom: string;
  cin: string;
}

interface FormData {
  creditImpôt: boolean;
  droitTirage: string;
  modeFormation: string;
  coOrganisateurs: string;
  lieuDeroulement: string;
  horaireDe: string;
  horaireA: string;
  pauseDe: string;
  pauseA: string;
  formateur: Formateur;
  entrepriseBeneficiaire: string;
  themeFormation?: number;
  periodeDu?: string;
  periodeAu?: string;
}
const FeuillePresence = () => {
  const [calendrierData, setCalendrierData] = useState<Theme[]>([]);
  const [filteredThemes, setFilteredThemes] = useState<Theme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [formData, setFormData] = useState<FormData>({
    creditImpôt: false,
    droitTirage: '',
    modeFormation: '',
    coOrganisateurs: '',
    lieuDeroulement: '',
    horaireDe: '',
    horaireA: '',
    pauseDe: '',
    pauseA: '',
    formateur: {
      nomPrenom: '',
      cin: '',
    },
    entrepriseBeneficiaire: '',
  });
  const [showParticipantColumns, setShowParticipantColumns] = useState({
    CIN: true,
    directionService: true,
    entreprise: true
  });
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/calendrierDetails`)
      .then(response => {
        setCalendrierData(response.data);
        // Filtrer les thèmes non null
        const themesWithData = response.data.filter((item: Theme) => item.theme !== null);
        setFilteredThemes(themesWithData);
      })
      .catch(error => {
        console.error("Erreur lors du chargement des thèmes :", error);
      });
  }, []);

  
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const themeId = parseInt(e.target.value);
    const theme = filteredThemes.find(t => t.id === themeId) || null;
    setSelectedTheme(theme);
    
    setFormData(prev => ({
      ...prev,
      themeFormation: themeId,
      lieuDeroulement: theme?.domaine || '',
      periodeDu: theme?.date_debut ? theme.date_debut.split('T')[0] : '',
      periodeAu: theme?.date_fin ? theme.date_fin.split('T')[0] : '',
      formateur: {
        ...prev.formateur,
        nomPrenom: theme?.formateur || ''
      }
    }));
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFormateurChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      formateur: {
        ...prevData.formateur,
        [name]: value
      }
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: checked,
    }));
  };
  const addParticipant = () => {
    setParticipants(prevParticipants => [
      ...prevParticipants,
      { 
        id: Date.now(), // Utilisation d'un timestamp pour un ID unique
        nomPrenom: '', 
        CIN: 0 , 
        directionService: '', 
        entreprise: '', 
        emargements: generateEmargementDays() 
      },
    ]);
  };
  const removeParticipant = (id: number) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };
  const generateEmargementDays = (): Record<string, string> => {
    if (!selectedTheme) return {};
    
    const emargements: Record<string, string> = {};
    const startDate = new Date(selectedTheme.date_debut);
    const endDate = new Date(selectedTheme.date_fin);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        emargements[dateStr] = ''; // Initialise avec une chaîne vide
    }
    
    return emargements;
};
  const handleFormSubmit = async () => {
    try {
      if (!selectedTheme) throw new Error("Veuillez sélectionner un thème de formation");
      if (participants.length === 0) throw new Error("Au moins un participant doit être ajouté");
  
      // Validation des participants
      const invalidParticipants = participants.filter(p => !p.CIN);
      if (invalidParticipants.length > 0) {
        throw new Error(`Les participants suivants n'ont pas de CIN: ${
          invalidParticipants.map(p => p.nomPrenom).join(', ')
        }`);
      }
  
      const payload = {
        creditImpôt: formData.creditImpôt ? 1 : 0,
        droitTirage: formData.droitTirage,
        modeFormation: formData.modeFormation,
        coOrganisateurs: formData.coOrganisateurs || '',
        horaire_debut: formData.horaireDe,
        horaire_fin: formData.horaireA,
        pause_debut: formData.pauseDe,
        pause_fin: formData.pauseA,
        entreprise_beneficiaire: formData.entrepriseBeneficiaire || '',
        idCalendrier: selectedTheme.id,
        participants: participants.map(p => ({
          CIN: p.CIN, // Notez la correspondance entre cin (front) et CIN (back)
          nomComplet: p.nomPrenom,
          mail: p.mail || '',
          telephone: p.telephone || '',
          emargements: p.emargements || generateEmargementDays(),
          direction_service: p.directionService || '',
          nom_entreprise: p.entreprise || '',
          nature_participant: p.nature_participant || 'interne',
          matricule: p.matricule || '',
          adr_entreprise: p.adr_entreprise || '',
          email_entreprise: p.email_entreprise || '',
          tel_entreprise: p.tel_entreprise || '',
          adresse: p.adresse || ''
        }))
      };
  
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/apiAdmin/feuillePresence`, 
        payload,
        { 
          headers: { 'Content-Type': 'application/json' },
          validateStatus: () => true // Pour gérer manuellement les erreurs
        }
      );
  
      if (response.status === 201 && response.data.success) {
        alert('Feuille de présence enregistrée avec succès !');
        // Réinitialisation du formulaire
        setFormData({
          creditImpôt: false,
          droitTirage: '',
          modeFormation: '',
          coOrganisateurs: '',
          horaireDe: '',
          horaireA: '',
          pauseDe: '',
          pauseA: '',
          entrepriseBeneficiaire: '',
          lieuDeroulement: '',
          formateur: {
            nomPrenom: '',
            cin: ''
          }
        });
        setParticipants([]);
        setSelectedTheme(null);
      } else {
        throw new Error(response.data.error || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi des données:", error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Une erreur est survenue'}`);
    }
  };
  const renderEmargementColumns = () => {
    if (!selectedTheme) return null;
    
    const columns = [];
    const startDate = new Date(selectedTheme.date_debut);
    const endDate = new Date(selectedTheme.date_fin);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toLocaleDateString('fr-FR');
      columns.push(
        <th key={dateStr} className="border p-2">
          <div className="flex justify-between items-center">
            <span>Journée du {dateStr}</span>
            <button 
              onClick={() => handleRemoveEmargementColumn(d.toISOString().split('T')[0])}
              className="text-red-500 text-xs"
            >
              ×
            </button>
          </div>
        </th>
      );
    }
    
    return columns;
  };
  const handleRemoveEmargementColumn = (dateKey: string) => {
    setParticipants(prev => 
      prev.map(p => {
        const newEmargements = {...p.emargements};
        delete newEmargements[dateKey];
        return {...p, emargements: newEmargements};
      })
    );
  };


  const renderEmargementCells = (participant:Participant) => {
    if (!selectedTheme) return null;
    
    const cells = [];
    const startDate = new Date(selectedTheme.date_debut);
    const endDate = new Date(selectedTheme.date_fin);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      cells.push(
        <td key={dateKey} className="border p-2">
          <input 
            type="text"
            value={participant.emargements[dateKey] || ''} 
            onChange={(e) => {
              const updatedParticipants = [...participants];
              const participantIndex = updatedParticipants.findIndex(p => p.id === participant.id);
              updatedParticipants[participantIndex].emargements[dateKey] = e.target.value;
              setParticipants(updatedParticipants);
            }} 
            className="w-full p-1 border rounded"
            placeholder=""
          />
        </td>
      );
    }
    
    return cells;
  };

  const toggleParticipantColumn = (column: keyof typeof showParticipantColumns) => {
    setShowParticipantColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  
  return (
    <div className="container mx-auto p-4 font-sans">

      <h1 className="text-2xl text-teal-600 font-bold text-center mb-6">Feuille de Présence</h1>
      
      {/* Section Crédit d'impôt et Droits de tirage */}
      <div className="mb-6 p-4 border rounded">
        <div className="flex items-center mb-4">
          <input 
            type="checkbox" 
            id="creditImpôt" 
            name="creditImpôt"
            checked={formData.creditImpôt} 
            onChange={handleCheckboxChange} 
            className="mr-2"
          />
          <label htmlFor="creditImpôt" className="font-bold">Crédit d'impôt</label>
        </div>
        
        <div className="mb-4">
          <label className="font-bold">Droits de tirage :</label>
          <div className="flex mt-2">
            <div className="flex items-center mr-4">
              <input 
                type="radio" 
                id="droitIndividuel" 
                name="droitTirage" 
                value="individuel" 
                checked={formData.droitTirage === 'individuel'} 
                onChange={handleChange} 
                className="mr-2"
              />
              <label htmlFor="droitIndividuel">Individuel</label>
            </div>
            <div className="flex items-center">
              <input 
                type="radio" 
                id="droitCollectif" 
                name="droitTirage" 
                value="collectif" 
                checked={formData.droitTirage === 'collectif'} 
                onChange={handleChange} 
                className="mr-2"
              />
              <label htmlFor="droitCollectif">Collectif</label>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="font-bold">Mode de formation :</label>
          <div className="flex mt-2">
            <div className="flex items-center mr-4">
              <input 
                type="radio" 
                id="intraEntreprise" 
                name="modeFormation" 
                value="intra-entreprise" 
                checked={formData.modeFormation === 'intra-entreprise'} 
                onChange={handleChange} 
                className="mr-2"
              />
              <label htmlFor="intraEntreprise">Intra-entreprise</label>
            </div>
            <div className="flex items-center">
              <input 
                type="radio" 
                id="interEntreprise" 
                name="modeFormation" 
                value="inter-entreprise" 
                checked={formData.modeFormation === 'inter-entreprise'} 
                onChange={handleChange} 
                className="mr-2"
              />
              <label htmlFor="interEntreprise">Inter-entreprise</label>
            </div>
          </div>
        </div>
      </div>
      
      {/* Section Thème et Informations */}
      <div className="mb-6 p-4 border rounded">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-bold mb-1">Thème de Formation :</label>
            <select 
              name="themeFormation"
              value={formData.themeFormation || ''} 
              onChange={handleThemeChange} 
              className="w-full p-2 border rounded"
            >
              <option value="">Sélectionner un thème</option>
              {filteredThemes.map(theme => (
                <option key={theme.id} value={theme.id}>
                  {theme.theme} (Formateur: {theme.formateur || 'Non spécifié'})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block font-bold mb-1">Lieu de déroulement :</label>
            <input 
              type="text" 
              name="lieuDeroulement"
              value={formData.lieuDeroulement} 
              onChange={handleChange} 
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-bold mb-1">Période de formation :</label>
            <div className="flex items-center">
              <span className="mr-2">Du :</span>
              <input 
                type="date" 
                name="periodeDu"
                value={formData.periodeDu} 
                onChange={handleChange} 
                className="p-2 border rounded"
              />
              <span className="mx-2">Au :</span>
              <input 
                type="date" 
                name="periodeAu"
                value={formData.periodeAu} 
                onChange={handleChange} 
                className="p-2 border rounded"
              />
            </div>
          </div>
          
          <div>
            <label className="block font-bold mb-1">Durée :</label>
            <div className="p-2 bg-gray-100 rounded">
              {selectedTheme?.nbj || 0} jour(s)
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold mb-1">Horaires :</label>
            <div className="flex items-center">
              <span className="mr-2">De :</span>
              <input 
                type="time" 
                name="horaireDe"
                value={formData.horaireDe} 
                onChange={handleChange} 
                className="p-2 border rounded"
              />
              <span className="mx-2">À :</span>
              <input 
                type="time" 
                name="horaireA"
                value={formData.horaireA} 
                onChange={handleChange} 
                className="p-2 border rounded"
              />
            </div>
          </div>
          
          <div>
            <label className="block font-bold mb-1">Pause :</label>
            <div className="flex items-center">
              <span className="mr-2">De :</span>
              <input 
                type="time" 
                name="pauseDe"
                value={formData.pauseDe} 
                onChange={handleChange} 
                className="p-2 border rounded"
              />
              <span className="mx-2">À :</span>
              <input 
                type="time" 
                name="pauseA"
                value={formData.pauseA} 
                onChange={handleChange} 
                className="p-2 border rounded"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Participants */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold">Liste des Participants</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => toggleParticipantColumn('CIN')} 
              className="px-2 py-1 bg-gray-200 rounded text-sm"
            >
              {showParticipantColumns.CIN ? 'Masquer CIN' : 'Afficher CIN'}
            </button>
            <button 
              onClick={() => toggleParticipantColumn('directionService')} 
              className="px-2 py-1 bg-gray-200 rounded text-sm"
            >
              {showParticipantColumns.directionService ? 'Masquer Direction' : 'Afficher Direction'}
            </button>
            <button 
              onClick={() => toggleParticipantColumn('entreprise')} 
              className="px-2 py-1 bg-gray-200 rounded text-sm"
            >
              {showParticipantColumns.entreprise ? 'Masquer Entreprise' : 'Afficher Entreprise'}
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">n°</th>
                <th className="border p-2">Nom et prénom</th>
                {showParticipantColumns.CIN && <th className="border p-2">n° CIN</th>}
                {showParticipantColumns.directionService && <th className="border p-2">Direction / service</th>}
                {showParticipantColumns.entreprise && <th className="border p-2">Entreprise</th>}
                {selectedTheme && renderEmargementColumns()}
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((participant, index) => (
                <tr key={participant.id}>
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2">
                    <input 
                      type="text" 
                      value={participant.nomPrenom} 
                      onChange={(e) => {
                        const updatedParticipants = [...participants];
                        updatedParticipants[index].nomPrenom = e.target.value;
                        setParticipants(updatedParticipants);
                      }} 
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  {showParticipantColumns.CIN && (
                    <td className="border p-2">
                      <input 
                        type="number" 
                        value={participant.CIN} 
                        onChange={(e) => {
                          const updatedParticipants = [...participants];
                          updatedParticipants[index].CIN = e.target.value;
                          setParticipants(updatedParticipants);
                        }} 
                        className="w-full p-1 border rounded"
                      />
                    </td>
                  )}
                  {showParticipantColumns.directionService && (
                    <td className="border p-2">
                      <input 
                        type="text" 
                        value={participant.directionService} 
                        onChange={(e) => {
                          const updatedParticipants = [...participants];
                          updatedParticipants[index].directionService = e.target.value;
                          setParticipants(updatedParticipants);
                        }} 
                        className="w-full p-1 border rounded"
                      />
                    </td>
                  )}
                  {showParticipantColumns.entreprise && (
                    <td className="border p-2">
                      <input 
                        type="text" 
                        value={participant.entreprise} 
                        onChange={(e) => {
                          const updatedParticipants = [...participants];
                          updatedParticipants[index].entreprise = e.target.value;
                          setParticipants(updatedParticipants);
                        }} 
                        className="w-full p-1 border rounded"
                      />
                    </td>
                  )}
                  {selectedTheme && renderEmargementCells(participant)}
                  <td className="border p-2">
                    <button 
                      onClick={() => removeParticipant(participant.id)}
                      className="text-red-500 text-sm"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button 
          onClick={addParticipant} 
          className="mt-2 px-4 py-2  text-black rounded hover:bg-gray-400"
        >
          + 
        </button>
      </div>
      
      {/* Formateurs */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="font-bold mb-4">Formateur</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Nom et prénom</label>
            <input 
              type="text" 
              name="nomPrenom"
              value={formData.formateur.nomPrenom} 
              onChange={handleFormateurChange} 
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block mb-1">CIN N°</label>
            <input 
              type="text" 
              name="cin"
              value={formData.formateur.cin} 
              onChange={handleFormateurChange} 
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>
      
      
      {/* Entreprise bénéficiaire */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="font-bold mb-4">Entreprise bénéficiaire :</h2>
        <input 
          type="text" 
          name="entrepriseBeneficiaire"
          value={formData.entrepriseBeneficiaire} 
          onChange={handleChange} 
          className="w-full p-2 border rounded mb-4"
        />
        
        <div className="mb-4">
          <p className="text-sm mb-2">
            <strong>Important :</strong> Si le séminaire est co-organisé avec d'autres opérateurs de formation, indiquer les ci-dessous :
          </p>
          <textarea 
            name="coOrganisateurs"
            value={formData.coOrganisateurs} 
            onChange={handleChange} 
            className="w-full p-2 border rounded"
            rows="3"
          />
        </div>
        
        {/*<div className="mt-8 pt-4 border-t">
          <p className="font-bold mb-2">Signature et Cachet de l'organisme de formation / Entreprise</p>
          <div className="h-20 border-2 border-dashed"></div>
        </div>*/}
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <button 
          onClick={handleFormSubmit} 
          className="px-6 py-3 bg-teal-500 text-white rounded hover:bg-green-600"
        >
          Enregistrer la feuille de présence
        </button>
      </div>
    </div>
  );
};

export default FeuillePresence;