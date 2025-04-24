
import React, { useState } from "react";
import axios from "axios";

const DemanderFormation = () => {
  const [formData, setFormData] = useState({
    domaine: '',
    theme: '',
    formateur: '',
    niveau: 'débutant',
    nombreParticipants: '',
    quiDemande: 'personne',
    contactMail: '',
    contactTel: '',
    matricule: '',
    description:'',
    genreFormation:'intra',
  });

  const [error, setError] = useState('');

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;

    // Si le champ modifié est "nombreParticipants", vérifier qu'il est un nombre positif
    if (name === 'nombreParticipants' && value !== '' && parseInt(value) < 0) {
      setError('Le nombre de participants ne peut pas être négatif.');
      return; // Ne pas mettre à jour l'état si la valeur est invalide
    }

    setFormData({
      ...formData,
      [name]: value,
    });

    // Réinitialiser l'erreur si la saisie est correcte
    if (name === 'nombreParticipants' && parseInt(value) >= 0) {
      setError('');
    }
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
      
    // Validation des champs obligatoires
    const requiredFields: (keyof typeof formData)[] = [
      'domaine',
      'theme',
      'niveau',
      'contactMail',
      'contactTel',
      'nombreParticipants',
      'quiDemande',
      'genreFormation',
    ];
  
    if (formData.quiDemande === 'entreprise') {
      requiredFields.push('matricule');
    }
  
    for (let field of requiredFields) {
      if (!formData[field]) {
        setError(`Le champ ${field} est obligatoire.`);
        return;
      }
    }
    console.log("Données envoyées :", formData); //  Affichage des données avant l'envoi

    try {
      const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/apiUser/demanderFormation`, formData);
      console.log(response.data);  // Message de succès
      alert('Merci pour votre demande !')
      setError('');
      // Vous pouvez également rediriger ou réinitialiser le formulaire
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande:', error);
      setError('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white border rounded-lg shadow-md"> {/* Changé de max-w-lg à max-w-4xl */}
    <div className="py-3"> 
      <h2 className="text-2xl text-teal-600 font-bold mb-6 text-center">Demande de Formation Personnalisée</h2> {/* Texte agrandi et centré */}
        
      {/* Affichage de l'erreur */}
      {error && <div className="text-red-500 mb-4">{error}</div>}

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
           Recommandez un Formateur ?
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
          >
            <option value="débutant">Débutant</option>
            <option value="avancé">Avancé</option>
          </select>
        </div>

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
            min="0" // Empêche de saisir des nombres négatifs via l'input HTML
            className="mt-1 p-2 border border-gray-300 rounded-md w-full"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="genreFormation">
            Genre formation *
          </label>
          <select
            id="genreFormation"
            name="genreFormation"
            value={formData.genreFormation}
            onChange={handleChange}
            className="mt-1 p-2 border border-gray-300 rounded-md w-full"
            >
            <option value="inter(seminaire)">seminaire</option>
            <option value="intra">Intra</option>
          </select>
        </div>
        {/* Qui demande */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="quiDemande">
            Qui demande ?
          </label>
          <select
            id="quiDemande"
            name="quiDemande"
            value={formData.quiDemande}
            onChange={handleChange}
            className="mt-1 p-2 border border-gray-300 rounded-md w-full"
          >
            <option value="personne">Personne</option>
            <option value="entreprise">Entreprise</option>
          </select>
        </div>

        {/* Contact */}
        {formData.quiDemande === 'entreprise' ? (
          <div className="space-y-4">
            {/* Email Entreprise */}
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="contactMail">
                Email de l'entreprise *
              </label>
              <input
                type="email"
                id="contactMail"
                name="contactMail"
                value={formData.contactMail}
                onChange={handleChange}
                required
                className="mt-1 p-2 border border-gray-300 rounded-md w-full"
              />
            </div>

            {/* Téléphone Entreprise */}
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="contactTel">
                Téléphone de l'entreprise *
              </label>
              <input
                type="tel"
                id="contactTel"
                name="contactTel"
                value={formData.contactTel}
                onChange={handleChange}
                required
                className="mt-1 p-2 border border-gray-300 rounded-md w-full"
              />
            </div>

            {/* Matricule Entreprise */}
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="matricule">
                Matricule de l'entreprise *
              </label>
              <input
                type="text"
                id="matricule"
                name="matricule"
                value={formData.matricule}
                onChange={handleChange}
                required
                className="mt-1 p-2 border border-gray-300 rounded-md w-full"
              />
            </div>
            <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="description">
           Plus de détails ? 
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 p-2 border border-gray-300 rounded-md w-full"
          />
        </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Email Personne */}
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="contactMail">
                Votre Email *
              </label>
              <input
                type="email"
                id="contactMail"
                name="contactMail"
                value={formData.contactMail}
                onChange={handleChange}
                required
                className="mt-1 p-2 border border-gray-300 rounded-md w-full"
              />
            </div>

            {/* Téléphone Personne */}
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="contactTel">
                Votre Téléphone *
              </label>
              <input
                type="tel"
                id="contactTel"
                name="contactTel"
                value={formData.contactTel}
                onChange={handleChange}
                required
                className="mt-1 p-2 border border-gray-300 rounded-md w-full"
              />
            </div>
            <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="description">
           Plus de détails ? 
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 p-2 border border-gray-300 rounded-md w-full"
          />
        </div>
          </div>
        )}

        {/* Submit */}
        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600"
          >
             
            Soumettre la demande
          </button>
        </div>
      </form>
    </div></div>
  );
};

export default DemanderFormation;
