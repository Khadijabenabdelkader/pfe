import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, HeadingLevel, AlignmentType } from "docx";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface Theme {
  id_session: number;
  theme_nom: string;
  formateur_nom: string;
  date_debut: string;
  date_fin: string;
  lieu: string;
  duree: number;
  mode?: string;
  credit_import?: boolean | null;
  emargement?: string | null;
  droit_triage?: string | null;
  nb_participant?: number;
}

interface Participant {
  id: number;
  nomPrenom: string;
  CIN: string;
  emargements: Record<string, string>;
  mail?: string;
  telephone?: string;
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
  duree: number;
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
  const [filteredThemes, setFilteredThemes] = useState<Theme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [formData, setFormData] = useState<FormData>({
    creditImpôt: false,
    droitTirage: '',
    modeFormation: '',
    coOrganisateurs: '',
    lieuDeroulement: '',
    duree: 0,
    horaireDe: '08:30',
    horaireA: '17:00',
    pauseDe: '12:00',
    pauseA: '13:30',
    formateur: {
      nomPrenom: '',
      cin: '',
    },
    entrepriseBeneficiaire: '',
  });
  const [showParticipantColumns, setShowParticipantColumns] = useState({
    CIN: true,
    mail: true
  });

  const generatePDF = async () => {
    try {
      // Sélectionner l'élément à convertir en PDF
      const element = document.getElementById("feuille-presence");
      
      if (!element) {
        throw new Error("Élément introuvable pour la génération du PDF");
      }
  
      // Utiliser html2canvas pour capturer le contenu
      const canvas = await html2canvas(element, {
        scale: 2, // Améliore la qualité
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
  
      // Calculer les dimensions du PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
      });
  
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
  
      // Ajouter la première page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
  
      // Ajouter des pages supplémentaires si nécessaire
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
  
      // Télécharger le PDF
      const fileName = `Feuille_Presence_${selectedTheme?.theme_nom.replace(/\s+/g, '_') || 'formation'}.pdf`;
      pdf.save(fileName);
  
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      alert("Une erreur est survenue lors de la génération du PDF");
    }
  };

  const generateWordDocument = () => {
    if (!selectedTheme) return;
  
    // Création des paragraphes pour les informations de base
    const title = new Paragraph({
      text: "FEUILLE DE PRÉSENCE",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    });
  
    const themeInfo = new Paragraph({
      children: [
        new TextRun({
          text: `Thème de formation: ${selectedTheme.theme_nom}`,
          bold: true,
        }),
      ],
      spacing: { after: 100 },
    });
  
    const dateInfo = new Paragraph({
      children: [
        new TextRun({
          text: `Période: Du ${formatDateForDisplay(selectedTheme.date_debut)} au ${formatDateForDisplay(selectedTheme.date_fin)}`,
        }),
      ],
      spacing: { after: 100 },
    });
  
    const formateurInfo = new Paragraph({
      children: [
        new TextRun({
          text: `Formateur: ${formData.formateur.nomPrenom}`,
        }),
      ],
      spacing: { after: 100 },
    });
  
    const lieuInfo = new Paragraph({
      children: [
        new TextRun({
          text: `Lieu: ${formData.lieuDeroulement}`,
        }),
      ],
      spacing: { after: 200 },
    });
  
    // Création du tableau des participants
    const participantRows = [
      // En-tête du tableau
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph("N°")], width: { size: 500, type: WidthType.DXA } }),
          new TableCell({ children: [new Paragraph("Nom et Prénom")], width: { size: 3000, type: WidthType.DXA } }),
          ...(showParticipantColumns.CIN ? [new TableCell({ children: [new Paragraph("CIN")], width: { size: 1500, type: WidthType.DXA } })] : []),
          ...(showParticipantColumns.directionService ? [new TableCell({ children: [new Paragraph("Direction/Service")], width: { size: 2000, type: WidthType.DXA } })] : []),
          ...(showParticipantColumns.entreprise ? [new TableCell({ children: [new Paragraph("Entreprise")], width: { size: 2000, type: WidthType.DXA } })] : []),
          // Colonnes d'émargement
          ...generateEmargementHeaders(),
        ],
      }),
      // Lignes des participants
      ...participants.map((participant, index) => 
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph((index + 1).toString())] }),
            new TableCell({ children: [new Paragraph(participant.nomPrenom)] }),
            ...(showParticipantColumns.CIN ? [new TableCell({ children: [new Paragraph(participant.CIN)] })] : []),
            ...(showParticipantColumns.directionService ? [new TableCell({ children: [new Paragraph(participant.directionService)] })] : []),
            ...(showParticipantColumns.entreprise ? [new TableCell({ children: [new Paragraph(participant.entreprise)] })] : []),
            // Cellules d'émargement
            ...generateEmargementCells(participant),
          ],
        })
      ),
    ];
  
    const participantsTable = new Table({
      rows: participantRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    });
  
    // Création du document final
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          title,
          themeInfo,
          dateInfo,
          formateurInfo,
          lieuInfo,
          new Paragraph({
            text: "Liste des participants:",
            bold: true,
            spacing: { before: 200, after: 100 },
          }),
          participantsTable,
          // Ajoutez d'autres éléments comme les signatures si nécessaire
        ],
      }],
    });
  
    return doc;
  };
  
  // Fonction utilitaire pour formater la date
  const formatDateForDisplay = (dateString: string) => {
    const date = parseCustomDate(dateString);
    if (!date) return '';
    return date.toLocaleDateString('fr-FR');
  };
  
  // Fonction pour générer les en-têtes d'émargement
  const generateEmargementHeaders = () => {
    if (!selectedTheme) return [];
    
    const headers = [];
    const startDate = parseCustomDate(selectedTheme.date_debut);
    const endDate = parseCustomDate(selectedTheme.date_fin);
    
    if (!startDate || !endDate) return [];
    
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      headers.push(
        new TableCell({
          children: [new Paragraph(formatDateForDisplay(currentDate.toISOString()))],
          width: { size: 1500, type: WidthType.DXA },
        })
      );
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return headers;
  };
  
  // Fonction pour générer les cellules d'émargement
  const generateEmargementCells = (participant: Participant) => {
    if (!selectedTheme) return [];
    
    const cells = [];
    const startDate = parseCustomDate(selectedTheme.date_debut);
    const endDate = parseCustomDate(selectedTheme.date_fin);
    
    if (!startDate || !endDate) return [];
    
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      cells.push(
        new TableCell({
          children: [new Paragraph(participant.emargements[dateKey] || '')],
        })
      );
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return cells;
  };

  // Récupérer les détails de la session
  const fetchSessionDetails = async (idSession: number) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/session/${idSession}`);
      const { session, participants } = response.data.data;
      
      // Mapper les données de la session
      setSelectedTheme({
        id_session: session.id_session,
        theme_nom: session.theme_nom,
        formateur_nom: session.formateur_nom,
        date_debut: session.date_debut,
        date_fin: session.date_fin,
        duree: session.duree,
        lieu: session.lieu
      });

      // Mapper les participants
      const mappedParticipants = participants.map((p: any) => ({
        id: p.id,
        nomPrenom: p.nom_complet,
        CIN: p.CIN,
        mail: p.mail || '',
        telephone: p.telephone || '',
        emargements: p.emargement ? JSON.parse(p.emargement) : generateEmargementDays(session.date_debut, session.date_fin),
        // Autres champs si nécessaire
      }));

      setParticipants(mappedParticipants);

      // Mettre à jour formData
      setFormData(prev => ({
        ...prev,
        themeFormation: session.id_session,
        lieuDeroulement: session.lieu,
        periodeDu: formatDateForInput(session.date_debut), // Use formatted date
        periodeAu: formatDateForInput(session.date_fin),formateur: {
          nomPrenom: session.formateur_nom,
          cin: '' // À récupérer si disponible
        },
        horaireDe: session.horaire_debut || '',
        horaireA: session.horaire_fin || '',
        modeFormation: session.mode || '',
        droitTirage: session.droit_tirage || '',
        creditImpôt: session.credit_import === '1'
      }));

    } catch (error) {
      console.error("Erreur lors du chargement de la session:", error);
    }
  };
  const formatDateForInput = (dateString: string): string => {
    const date = parseCustomDate(dateString);
    if (!date) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };
  useEffect(() => {
    const loadThemes = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/sessions`);
        console.log('Réponse API:', response.data); // Debug
        
        // Adaptez selon la structure réelle de votre réponse
        const themesData = response.data.data || response.data;
        setFilteredThemes(themesData);
      } catch (error) {
        console.error("Erreur lors du chargement des thèmes:", error);
      }
    };
    loadThemes();
  }, []);
  const parseCustomDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    
    // Essayer le format DD/MM/YYYY
    const parts = dateString.split('/');
    if (parts.length === 3) {
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    
    // Essayer le format ISO
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) return date;
    
    console.error("Format de date non reconnu:", dateString);
    return null;
  };
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const themeId = parseInt(e.target.value);
    const theme = filteredThemes.find(t => t.id_session === themeId) || null;
    setSelectedTheme(theme);
    
    setFormData(prev => ({
      ...prev,
      themeFormation: themeId,
      lieuDeroulement: theme?.lieu || '',
      periodeDu: theme?.date_debut ? theme.date_debut.split('T')[0] : '',
      periodeAu: theme?.date_fin ? theme.date_fin.split('T')[0] : '',
      formateur: {
        ...prev.formateur,
        nomPrenom: theme?.formateur_nom || ''
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
  const removeParticipant = (id: number) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: checked,
    }));
  };

const addParticipant = () => {
    if (!selectedTheme) return;
    
    setParticipants(prev => [
      ...prev,
      {
        id: Date.now(),
        nomPrenom: '',
        CIN: '',
        emargements: generateEmargementDays(selectedTheme.date_debut, selectedTheme.date_fin)
      }
    ]);
  };
  const generateEmargementDays = (startDateStr: string, endDateStr: string): Record<string, string> => {
    const emargements: Record<string, string> = {};
    const startDate = parseCustomDate(startDateStr);
    const endDate = parseCustomDate(endDateStr);
  
    if (!startDate || !endDate) {
      console.error("Dates invalides pour générer les émargements");
      return {};
    }
  
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      emargements[dateKey] = '';
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return emargements;
  };
  // Modifier la soumission pour correspondre au backend
  const handleFormSubmit = async () => {
    try {
        // Validation
        if (!selectedTheme?.id_session) {
            throw new Error("Veuillez sélectionner une session");
        }

        if (!participants.length) {
            throw new Error("Veuillez ajouter au moins un participant");
        }

        // Construction du payload
        const payload = {
          id_session: selectedTheme.id_session, // <-- Nom conforme au backend
            participants: participants.map(p => ({
                CIN: p.CIN,
                nomComplet: p.nomPrenom, // <-- Nom conforme au backend
                mail: p.mail || null,
                telephone: p.telephone || null,
                emargements: p.emargements || {},
            })),
            creditImpôt: formData.creditImpôt,
            droitTirage: formData.droitTirage,
            modeFormation: formData.modeFormation,
            coOrganisateurs: formData.coOrganisateurs,
            entreprise_beneficiaire: formData.entrepriseBeneficiaire
        };

        console.log('Envoi du payload:', payload);

        // Envoi à l'API
        const response = await axios.post(
            `${import.meta.env.VITE_APP_API_URL}/apiAdmin/participations`, // <-- Endpoint corrigé
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                timeout: 10000
            }
        );

        console.log('Réponse API:', response.data);

        // Vérification de la réponse
        if (!response.data.success) {
            throw new Error(response.data.error || "Erreur serveur");
        }

        // Mise à jour des IDs des participants
        const apiResults = response.data.data?.results || [];
        if (apiResults.length > 0) {
            const updatedParticipants = participants.map(p => {
                const match = apiResults.find((r: any) => r.CIN === p.CIN);
                return match?.id_participant 
                    ? { ...p, id: match.id_participant }
                    : p;
            });
            setParticipants(updatedParticipants);
        }

        alert(response.data.data?.message || "Enregistrement réussi");

    
    
    
    
        const doc = generateWordDocument();
    
    // Utiliser docx pour exporter le document
    const { Packer } = await import('docx');
    const blob = await Packer.toBlob(doc);
    
    // Créer un lien de téléchargement
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Feuille_Presence_${selectedTheme.theme_nom.replace(/\s+/g, '_')}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur complète:', {
          message: error.message,
          response: error.response?.data
      });

      let errorMessage = error.message;
      if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
      }

      alert(`Erreur: ${errorMessage}`);
  }
};
  const renderEmargementColumns = () => {
    if (!selectedTheme) return null;
    
    const startDate = parseCustomDate(selectedTheme.date_debut);
    const endDate = parseCustomDate(selectedTheme.date_fin);
  
    if (!startDate || !endDate) {
      console.error("Dates invalides:", selectedTheme.date_debut, selectedTheme.date_fin);
      return null;
    }
  
    const columns = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const formattedDate = currentDate.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
  
      columns.push(
        <th key={dateKey} className="border p-2">
          <div className="flex justify-between items-center">
            <span>Journée du {formattedDate}</span>
            <button 
              onClick={() => handleRemoveEmargementColumn(dateKey)}
              className="text-red-500 text-xs"
            >
              ×
            </button>
          </div>
        </th>
      );
  
      currentDate.setDate(currentDate.getDate() + 1);
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


  const renderEmargementCells = (participant: Participant) => {
    if (!selectedTheme) return null;
    
    const startDate = parseCustomDate(selectedTheme.date_debut);
    const endDate = parseCustomDate(selectedTheme.date_fin);
  
    if (!startDate || !endDate) return null;
  
    const cells = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
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
      currentDate.setDate(currentDate.getDate() + 1);
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
    <div id="feuille-presence" className="container mx-auto p-4 font-sans">
      <h1 className="text-2xl font-bold text-center mb-6">Feuille de Présence</h1>
      
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
        <select 
  name="themeFormation"
  value={formData.themeFormation || ''} 
  onChange={handleThemeChange} 
  className="w-full p-2 border rounded"
>
  <option value="">Sélectionner un thème</option>
  {filteredThemes.map(theme => (
    <option key={theme.id_session} value={theme.id_session}>
      {theme.theme_nom} (Formateur: {theme.formateur_nom || 'Non spécifié'})
    </option>
  ))}
</select>
          
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
  value={formatDateForInput(formData.periodeDu || '')} 
  onChange={handleChange} 
  className="p-2 border rounded"
/>
              <span className="mx-2">Au :</span>
              <input 
  type="date" 
  name="periodeAu"
  value={formatDateForInput(formData.periodeAu || '')} 
  onChange={handleChange} 
  className="p-2 border rounded"
/>
            </div>
          </div>
          
          <div>
            <label className="block font-bold mb-1">Durée :</label>
            <input 
              type="text" 
              name="duree"
              value={formData.duree} 
              onChange={handleChange} 
              className="w-full p-2 border rounded"
            />
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
<div className="mb-8">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-bold">Liste des Participants</h2>
    <div className="flex space-x-2">
      <button 
        onClick={() => toggleParticipantColumn('CIN')} 
        className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm"
      >
        {showParticipantColumns.CIN ? 'Masquer CIN' : 'Afficher CIN'}
      </button>
      
    </div>
  </div>
  
  <div className="overflow-x-auto rounded-lg shadow">
    <table className="min-w-full bg-white border">
      <thead>
        <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
          <th className="py-3 px-3 text-left border">N°</th>
          <th className="py-3 px-8 text-left border">Nom et Prénom</th>
          {showParticipantColumns.CIN && <th className="py-3 px-8 text-left border">N° CIN</th>}
          {showParticipantColumns.mail && <th className="py-3 px-8 text-left border">Email</th>}
          {selectedTheme && renderEmargementColumns()}
          <th className="py-3 px-6 text-center border">Actions</th>
        </tr>
      </thead>
      <tbody className="text-gray-600 text-sm font-light">
        {participants.map((participant, index) => (
          <tr 
            key={participant.id}
            className="border-b hover:bg-gray-100 transition duration-200"
          >
            <td className="py-3 px-3 border">{index + 1}</td>
            <td className="py-3 px-2 border">
              <input 
                type="text" 
                value={participant.nomPrenom} 
                onChange={(e) => {
                  const updatedParticipants = [...participants];
                  updatedParticipants[index].nomPrenom = e.target.value;
                  setParticipants(updatedParticipants);
                }} 
                className="w-full p-2 border rounded-md"
              />
            </td>

            {showParticipantColumns.CIN && (
              <td className="py-3 px-2 border">
                <input 
                  type="number" 
                  value={participant.CIN} 
                  onChange={(e) => {
                    const updatedParticipants = [...participants];
                    updatedParticipants[index].CIN = e.target.value;
                    setParticipants(updatedParticipants);
                  }} 
                  className="w-full p-2 border rounded-md"
                />
              </td>
            )}
            {showParticipantColumns.mail && (
              <td className="py-3 px-2 border">
                <input 
                  type="email" 
                  value={participant.mail} 
                  onChange={(e) => {
                    const updatedParticipants = [...participants];
                    updatedParticipants[index].mail = e.target.value;
                    setParticipants(updatedParticipants);
                  }} 
                  className="w-full p-2 border rounded-md"
                />
              </td>
            )}
            
            {selectedTheme && renderEmargementCells(participant)}

            <td className="py-3 px-6 text-center border">
            <button
                  onClick={() => removeParticipant(participant.id)}
                  className="text-red-600 hover:text-red-900 transition-colors"
                  title="Supprimer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  <div className="flex justify-end mt-4">
    <button 
      onClick={addParticipant} 
      className="flex items-center px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg shadow"
    >
      + Ajouter Participant
    </button>
  </div>
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
          className="px-6 py-3 bg-teal-500 text-white rounded hover:bg-teal-300"
        >
          Enregistrer la feuille de présence
        </button>
      </div>
    </div>
  );
};

export default FeuillePresence;