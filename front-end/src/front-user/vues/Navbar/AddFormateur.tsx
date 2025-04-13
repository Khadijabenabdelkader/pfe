import React, { useState } from 'react';
import axios from 'axios';

const AddFormateur: React.FC = () => {
  const [formData, setFormData] = useState({
    nom_complet: '',
    mail: '',
    adr: '',
    competences: '',
    themes_a_enseigner: '',
    tarif_journalier: '',
    nb_formations: '',
    tel: '',
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [cv, setCv] = useState<File | null>(null);
  const [errors, setErrors] = useState<any>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (name === 'photo' && files) setPhoto(files[0]);
    if (name === 'cv' && files) setCv(files[0]);
  };

  const validateForm = () => {
    const newErrors: any = {};
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    if (!emailPattern.test(formData.mail)) {
      newErrors.mail = "Veuillez entrer un email valide.";
    }

    if (!/^\d{8}$/.test(formData.tel)) {
      newErrors.tel = "Le numéro de téléphone doit contenir exactement 8 chiffres.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const response = await axios.post('${import.meta.env.VITE_APP_API_URL}/apiUser/formateurs', formData, {
          headers: { 'Content-Type': 'application/json' },
        });

        alert('Formateur ajouté avec succès');
      } catch (error: any) {
        console.error('Erreur lors de l\'ajout du formateur:', error.response?.data || error.message);
      }
    } else {
      alert('Veuillez corriger les erreurs.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto p-8 bg-gray-100 rounded-lg shadow-md mt-24">
      <h2 className="text-2xl font-semibold text-center mb-6">Ajouter un Formateur</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div className="input-group">
          <label className="block text-gray-700 mb-2">Nom complet :</label>
          <input
            type="text"
            name="nom_complet"
            placeholder="Nom complet"
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div className="input-group">
          <label className="block text-gray-700 mb-2">Email :</label>
          <input
            type="email"
            name="mail"
            placeholder="Email"
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            required
          />
          {errors.mail && <p className="text-red-500 text-xs mt-1">{errors.mail}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div className="input-group">
          <label className="block text-gray-700 mb-2">Adresse :</label>
          <input
            type="text"
            name="adr"
            placeholder="Adresse"
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="input-group">
          <label className="block text-gray-700 mb-2">Téléphone :</label>
          <input
            type="text"
            name="tel"
            placeholder="Téléphone"
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          />
          {errors.tel && <p className="text-red-500 text-xs mt-1">{errors.tel}</p>}
        </div>
      </div>

      <div className="input-group mb-6">
        <label className="block text-gray-700 mb-2">Photo :</label>
        <input
          type="file"
          name="photo"
          accept=".jpg, .jpeg, .png"
          onChange={handleFileChange}
          className="w-full p-3 border border-gray-300 rounded-md"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div className="input-group">
          <label className="block text-gray-700 mb-2">Tarif journalier :</label>
          <input
            type="number"
            name="tarif_journalier"
            placeholder="Tarif journalier"
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="input-group">
          <label className="block text-gray-700 mb-2">Nombre de formations :</label>
          <input
            type="number"
            name="nb_formations"
            placeholder="Nombre de formations"
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="input-group mb-6">
        <label className="block text-gray-700 mb-2">Compétences :</label>
        <textarea
          name="competences"
          placeholder="Compétences"
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
        ></textarea>
      </div>

      <div className="input-group mb-6">
        <label className="block text-gray-700 mb-2">Thèmes à enseigner :</label>
        <textarea
          name="themes_a_enseigner"
          placeholder="Thèmes à enseigner"
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
        ></textarea>
      </div>

      <div className="input-group mb-6">
        <label className="block text-gray-700 mb-2">CV :</label>
        <input
          type="file"
          name="cv"
          accept=".pdf"
          onChange={handleFileChange}
          className="w-full p-3 border border-gray-300 rounded-md"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 active:bg-indigo-700 transition duration-300"
      >
        Ajouter
      </button>
    </form>
  );
};

export default AddFormateur;
