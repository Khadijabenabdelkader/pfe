import React, { useState, useEffect } from "react";
import axios from "axios";

const DemanderFormation = () => {
  const [formData, setFormData] = useState({
    domaine: '',
    theme: '',
    formateur: '',
    niveau: 'débutant',
    nombreParticipants: '',
    details: '',
    mode: 'intra',
    id_participant: ''
  });

  const [error, setError] = useState('');

  // Récupérer l'ID du participant au chargement du composant
  useEffect(() => {
    const fetchParticipantDetails = () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        
        if (userData.id) {
          setFormData(prev => ({
            ...prev,
            id_participant: userData.id
          }));
        } else {
          console.error("ID participant non trouvé !");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des détails du participant:", error);
      }
    };

    fetchParticipantDetails();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Validation pour nombreParticipants
    if (name === 'nombreParticipants') {
      if (value !== '' && parseInt(value) < 0) {
        setError('Le nombre de participants ne peut pas être négatif.');
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Réinitialiser l'erreur si la saisie est correcte
    if (error && name === 'nombreParticipants' && parseInt(value) >= 0) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
      
    // Validation des champs obligatoires
    const requiredFields = ['domaine', 'theme', 'niveau', 'mode', 'nombreParticipants'];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        setError(`Le champ ${field} est obligatoire.`);
        return;
      }
    }

    // Validation du nombre de participants
    if (parseInt(formData.nombreParticipants) <= 0) {
      setError('Le nombre de participants doit être positif.');
      return;
    }

    console.log("Données envoyées :", formData);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/apiUser/demanderFormation/`, 
        formData
      );
      
      console.log(response.data);
      alert('Votre demande de formation a été enregistrée avec succès !');
      setError('');
      // Réinitialisation du formulaire après succès
      setFormData({
        domaine: '',
        theme: '',
        formateur: '',
        niveau: 'débutant',
        nombreParticipants: '',
        details: '',
        mode: 'intra',
        id_participant: formData.id_participant // Conserve l'id_participant
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande:', error);
      setError('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white border rounded-lg shadow-md">
      <div className="py-3"> 
        <h2 className="text-2xl text-teal-600 font-bold mb-6 text-center">
          Demande de Formation Personnalisée
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Domaine */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700" htmlFor="domaine">
              Domaine de la formation *
            </label>
            <input
              type="text"
              id="domaine"
              name="domaine"
              value={formData.domaine}
              onChange={handleChange}
              required
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
            />
          </div>

          {/* Thème */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700" htmlFor="theme">
              Thème de la formation *
            </label>
            <input
              type="text"
              id="theme"
              name="theme"
              value={formData.theme}
              onChange={handleChange}
              required
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
            />
          </div>

          {/* Formateur (Optionnel) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700" htmlFor="formateur">
              Recommandez un Formateur (optionnel)
            </label>
            <input
              type="text"
              id="formateur"
              name="formateur"
              value={formData.formateur}
              onChange={handleChange}
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
            />
          </div>

          {/* Niveau */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700" htmlFor="niveau">
              Niveau *
            </label>
            <select
              id="niveau"
              name="niveau"
              value={formData.niveau}
              onChange={handleChange}
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
              required
            >
              <option value="débutant">Débutant</option>
              <option value="intermédiaire">Intermédiaire</option>
              <option value="avancé">Avancé</option>
            </select>
          </div>

          {/* Nombre de participants */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700" htmlFor="nombreParticipants">
              Nombre de participants *
            </label>
            <input
              type="number"
              id="nombreParticipants"
              name="nombreParticipants"
              value={formData.nombreParticipants}
              onChange={handleChange}
              min="1"
              required
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
            />
          </div>
          
          {/* Mode de formation */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700" htmlFor="mode">
              Mode de formation *
            </label>
            <select
              id="mode"
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
              required
            >
              <option value="intra">Intra-entreprise</option>
              <option value="inter">Inter-entreprise</option>
            </select>
          </div>

          {/* Détails supplémentaires */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700" htmlFor="details">
              Détails supplémentaires (objectifs, besoins spécifiques, etc.)
            </label>
            <textarea
              id="details"
              name="details"
              value={formData.details}
              onChange={handleChange}
              rows={4}
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
            />
          </div>

          {/* Bouton de soumission */}
          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600 transition duration-300"
            >
              Soumettre la demande
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DemanderFormation;