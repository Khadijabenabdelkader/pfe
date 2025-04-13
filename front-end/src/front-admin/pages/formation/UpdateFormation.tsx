import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuthAdmin";
import { useForm, useFieldArray } from "react-hook-form";

interface Session {
  id_session: number;
  theme: string;
  date_debut: string;
  date_fin: string;
  duree: number;
  etat: string;
  type_session: string;
  formateur: string;
  id_formateur: number;
}
interface Formateur {
  id_formateur: number;
  nom_complet: string;
}

interface Formation {
  id_formation: number;
  domaine: string;
  sessions: Session[];
}

interface UpdateFormationProps {
  formation: Formation;
  onUpdate: () => void;
  onCancel: () => void;
}

const UpdateFormation: React.FC<UpdateFormationProps> = ({ formation, onUpdate, onCancel }) => {
  const [domaine, setDomaine] = useState(formation.domaine || "");
  const [sessions, setSessions] = useState<Session[]>(formation.sessions || []);
  const { user } = useAuth();
  const { register, handleSubmit, control, reset } = useForm<Formation>({
    defaultValues: {
      domaine: "",
      sessions: [{ theme: "", date_debut: "", date_fin: "", duree: 0, type_session: "", id_formateur: 0 }],
    },
  });

  const handleSessionChange = (index: number, field: string, value: any) => {
    const updatedSessions = [...sessions];
    updatedSessions[index] = { ...updatedSessions[index], [field]: value };
    setSessions(updatedSessions);
  };

  const handleFormateurChange = (index: number, id_formateur: number) => {
    const selectedFormateur = formateurs.find(formateur => formateur.id_formateur === id_formateur);
    if (selectedFormateur) {
      const updatedSessions = [...sessions];
      updatedSessions[index] = {
        ...updatedSessions[index],
        id_formateur,
        formateur: selectedFormateur.nom_complet
      };
      setSessions(updatedSessions);
    }
  };

  const handleUpdateFormation = async () => {
    if (user.nom_acces !== "super_admin") {
      alert("Vous n'avez pas l'accès pour modifier une formation.");
      return;
    }
    try {
      await axios.put(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formations/update/${formation.id_formation}`, {
        id_formation: formation.id_formation,
        domaine,
        sessions,
      });
      onUpdate();
      alert("Formation mise à jour avec succès !");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Erreur lors de la mise à jour de la formation:", error.response?.data || error.message);
      } else {
        console.error("Erreur lors de la mise à jour de la formation:", error);
      }
    }
  };

  const [formateurs, setFormateurs] = useState<Formateur[]>([]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formateurs`)
      .then(response => {
        setFormateurs(response.data);
      })
      .catch(error => console.error("❌ Erreur lors de la récupération des formateurs :", error));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-teal-800 mb-4">Modifier la Formation</h2>
      <div className="mb-4">
        <label className="block text-gray-700">Domaine</label>
        <input
          type="text"
          value={domaine}
          onChange={(e) => setDomaine(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      {sessions.map((session, index) => (
        <div key={session.id_session} className="mb-4">
          <h3 className="text-xl font-semibold text-gray-700">Session {index + 1}</h3>
          <div className="mb-2">
            <label className="block text-gray-700">Thème</label>
            <input
              type="text"
              value={session.theme}
              onChange={(e) => handleSessionChange(index, "theme", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-2">
            <label className="block text-gray-700">Durée</label>
            <input
              type="number"
              value={session.duree}
              onChange={(e) => handleSessionChange(index, "duree", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-2">
            <label className="block text-gray-700">Date Début</label>
            <input
              type="date"
              value={formatDate(session.date_debut)}
              onChange={(e) => handleSessionChange(index, "date_debut", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-2">
            <label className="block text-gray-700">Date Fin</label>
            <input
              type="date"
              value={formatDate(session.date_fin)}
              onChange={(e) => handleSessionChange(index, "date_fin", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-2">
            <label className="block text-gray-700">État</label>
            <input
              type="text"
              value={session.etat}
              onChange={(e) => handleSessionChange(index, "etat", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-2">
            <label className="block text-gray-700">Type de Session</label>
            <input
              type="text"
              value={session.type_session}
              onChange={(e) => handleSessionChange(index, "type_session", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-2">
            <label className="block text-gray-700">Formateur</label>
            <select
              className="w-full p-2 border rounded mb-2"
              value={session.id_formateur}
              onChange={(e) => handleFormateurChange(index, parseInt(e.target.value))}
            >
              <option value="">Sélectionnez un formateur</option>
              {formateurs.map((formateur) => (
                <option key={formateur.id_formateur} value={formateur.id_formateur}>
                  {formateur.nom_complet}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
      <div className="flex justify-between">
        <button
          onClick={handleUpdateFormation}
          className="bg-[#82b89a] text-white px-4 py-2 rounded-lg"
        >
          Mettre à jour
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg"
        >
          Annuler
        </button>
      </div>
    </div>
  );
};

export default UpdateFormation;