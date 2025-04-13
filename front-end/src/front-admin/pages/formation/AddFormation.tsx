
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";

// Définition des types
interface SessionData {
  theme: string;
  nb_participants: number;
  type_session: string;
  id_formateur: number;
  fiche_programme?: File;
  lieu?: string;
}

interface FormationData {
  id_formation: number;
  domaine: string;
  sessions: SessionData[];
}

interface AddFormationProps {
  onFormationAdded: () => void;
  onClose: () => void;
}

interface Formateur {
  id_formateur: number;
  nom_complet: string;
}

const AddFormation: React.FC<AddFormationProps> = ({ onClose, onFormationAdded }) => {
  const { register, handleSubmit, control, reset, setValue } = useForm<FormationData>({
    defaultValues: {
      domaine: "",
      sessions: [{ theme: "", nb_participants: 0, type_session: "", lieu: '', id_formateur: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sessions",
  });
  const [selectedType, setSelectedType] = useState('');

  const handleTypeChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
    setSelectedType(e.target.value);
  };

  const [formateurs, setFormateurs] = useState<Formateur[]>([]);
  const [formations, setFormations] = useState<FormationData[]>([]);
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formateurs`)
      .then(response => {
        setFormateurs(response.data);
      })
      .catch(error => console.error("❌ Erreur lors de la récupération des formateurs :", error));
      
      axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formations/Form`)
      .then(response =>{setFormations(response.data);})
      .catch(error => console.error("❌ Erreur lors de la récupération des formations :", error));
    }, []);

    const onSubmit = async (data: FormationData) => {
      try {
        const formData = new FormData();
        formData.append("domaine", data.domaine);
        formData.append("sessions", JSON.stringify(data.sessions));
    
        // Ajouter chaque fichier fiche_programme à FormData avec le même nom de champ
        data.sessions.forEach((session, index) => {
          if (session.fiche_programme) {
            formData.append("fiche_programme", session.fiche_programme); // Utiliser le même nom de champ
          }
        });
    
        const response = await axios.post(
          `${import.meta.env.VITE_APP_API_URL}/apiAdmin/formations/addFormation`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
    
        console.log("Réponse du backend:", response.data); // Log pour déboguer
    
        if (response.status !== 201 && response.status !== 200) {
          throw new Error("Erreur lors de l'ajout de la formation");
        }
        onFormationAdded();
        reset();
        alert("Formation ajoutée avec succès !");
      } catch (error) {
        console.error("🚨 Erreur lors de l'ajout :", axios.isAxiosError(error) ? error.response?.data || error.message : error);
      }
    };
  const [searchTerm, setSearchTerm] = useState(""); // État pour stocker la valeur de recherche
  // Filtrer les domaines en fonction de la saisie de l'utilisateur
  const distinctDomaines = [...new Set(formations.map((formation) => formation.domaine))];

  // Filtrer les domaines distincts en fonction de la saisie de l'utilisateur
  const filteredDomaines = distinctDomaines.filter((domaine) =>
    domaine.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const [selectedDomaine, setSelectedDomaine] = useState<string | null>(null); 
  const filteredFormations = selectedDomaine
    ? formations.filter((formation) => formation.domaine === selectedDomaine)
    : [];
  return (
    
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/2 sm:max-w-lg max-h-screen overflow-y-auto">
      <br/><br/><br/>
        <h2 className="text-2xl font-bold mb-4">Planifier une Formation</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
        <label className="block mb-2">Domaine :</label>
        <input
        type="text"
        className="w-full p-2 border rounded mb-2"
        placeholder="Rechercher un domaine..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)} 
        />
      <select
        className="w-full p-2 border rounded mb-2"
        {...register("domaine", { required: true })}
      >
        <option value="">Sélectionnez un domaine</option>
        {filteredDomaines.map((domaine, index) => (
          <option key={index} value={domaine}>
            {domaine}
          </option>
        ))}
      </select>

          <h3 className="text-xl font-semibold mb-2">Sessions :</h3>
          {fields.map((item, index) => (
            <div key={item.id} className="border p-3 mb-3 rounded bg-gray-100">
              <label>Thème :</label>
              <input className="w-full p-2 border rounded mb-2" {...register(`sessions.${index}.theme`, { required: true })} />
              
              <label className="block text-gray-700">Nombre de participants :</label>
              <input type="number" className="w-full p-2 border rounded mb-2" {...register(`sessions.${index}.nb_participants`, { required: true })} />
              
              <label>Type de Session :</label>
              <select className="w-full p-2 border rounded mb-2" {...register(`sessions.${index}.type_session`, { required: true })} onChange={handleTypeChange}>
                <option value="">Sélectionnez un type</option>
                <option value="Présentiel">Présentiel</option>
                <option value="En ligne">En ligne</option>
              </select>
              {selectedType === 'Présentiel' && (
                <div>
                  <label>Lieu :</label>
                  <input type="text" className="w-full p-2 border rounded mb-2" {...register(`sessions.${index}.lieu`)} />
                </div>
              )}
             
              <label>Formateur :</label>
              <select className="w-full p-2 border rounded mb-2" {...register(`sessions.${index}.id_formateur`, { required: true })}>
                <option value="">Sélectionnez un formateur</option>
                {formateurs.map((formateur) => (
                  <option key={formateur.id_formateur} value={formateur.id_formateur}>
                    {formateur.nom_complet}
                  </option>
                ))}
              </select>
              
              <label>Fiche Programme (PDF) :</label>
              <input type="file" accept="application/pdf" className="w-full p-2 border rounded mb-2" onChange={(e) => setValue(`sessions.${index}.fiche_programme`, e.target.files?.[0])} />
              </div>
          ))}
          {/*
              <button type="button" className="bg-gray-500 text-white p-2 rounded" onClick={() => remove(index)}>
                Supprimer cette session
              </button>
           
          <button type="button" className="bg-teal-600 text-white p-2 rounded mb-4" onClick={() => append({ theme: "", nb_participants: 0, type_session: "", lieu: '', id_formateur: 0 })}>
            Ajouter une session
          </button>*/}
          <div className="flex justify-end">
            <button type="button" className="bg-gray-500 text-white p-2 rounded mr-2" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="bg-teal-600 text-white p-2 rounded">
              Ajouter Formation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFormation;

















