import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import LogoDark from '/image.png';
import Logo from '/image.png';

const NewAdmin: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // État pour gérer les données du formulaire et les erreurs
  const [formData, setFormData] = useState({
    nom_admin: '',
    email_admin: '',
    mdp_admin: '',
    confirm_mdp: '',
    acces: '',
  });

  const [errors, setErrors] = useState({
    nom_admin: '',
    email_admin: '',
    mdp_admin: '',
    confirm_mdp: '',
    acces: '',
  });

  // Gestion des changements dans les champs du formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Fonction pour valider le formulaire
  const validateForm = () => {
    let formErrors = {
      nom_admin: '',
      email_admin: '',
      mdp_admin: '',
      confirm_mdp: '',
      acces: '',
    };

    if (!formData.nom_admin.trim()) formErrors.nom_admin = 'Le nom est requis.';
    if (!formData.email_admin.trim()) formErrors.email_admin = "L'email est requis.";
    if (!formData.mdp_admin) formErrors.mdp_admin = 'Le mot de passe est requis.';
    if (!formData.confirm_mdp) formErrors.confirm_mdp = 'La confirmation du mot de passe est requise.';
    if (!formData.acces) formErrors.acces = 'Le niveau d\'accès est requis.';

    if (formData.mdp_admin !== formData.confirm_mdp) {
      formErrors.confirm_mdp = 'Les mots de passe ne correspondent pas.';
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(formData.email_admin)) {
      formErrors.email_admin = "L'email n'est pas valide.";
    }

    setErrors(formErrors);
    return !Object.values(formErrors).some((error) => error !== '');
  };

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) return;

    try {
      await axios.post(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/admin`, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Compte créé avec succès !');
      navigate('/Admin/admin-list');
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message || 'Une erreur est survenue, veuillez réessayer.');
      } else {
        setErrorMessage('Erreur inattendue, veuillez réessayer.');
      }
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-teal-700 text-center flex-grow">Nouveau Admin</h1>

      <div className="flex items-center justify-center min-h-screen  p-6">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 xl:grid-cols-2">
          {/* Section gauche (Logo) */}
          <div className="hidden xl:flex items-center justify-center p-10 bg-gray-100 dark:bg-gray-900">
            <Link to="/">
              <img className="hidden dark:block w-48" src={Logo} alt="Logo" />
              <img className="dark:hidden w-48" src={LogoDark} alt="Logo" />
            </Link>
          </div>

          {/* Section droite (Formulaire) */}
          <div className="p-6 sm:p-12 xl:p-16">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Créer un nouveau compte Admin</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom</label>
                <input
                  type="text"
                  name="nom_admin"
                  value={formData.nom_admin}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {errors.nom_admin && <p className="text-red-500 text-sm">{errors.nom_admin}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  name="email_admin"
                  value={formData.email_admin}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {errors.email_admin && <p className="text-red-500 text-sm">{errors.email_admin}</p>}
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mot de passe</label>
                <input
                  type="password"
                  name="mdp_admin"
                  value={formData.mdp_admin}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {errors.mdp_admin && <p className="text-red-500 text-sm">{errors.mdp_admin}</p>}
              </div>

              {/* Confirmer le mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirmez le mot de passe</label>
                <input
                  type="password"
                  name="confirm_mdp"
                  value={formData.confirm_mdp}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {errors.confirm_mdp && <p className="text-red-500 text-sm">{errors.confirm_mdp}</p>}
              </div>

              {/* Sélection d'accès */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Accès</label>
                <select
                  name="acces"
                  value={formData.acces}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-800"
                >
                  <option value="">Sélectionner un accès</option>
                  <option value="1">Visiteur</option>
                  <option value="2">Éditeur Formateur</option>
                  <option value="3">Éditeur Formation</option>
                  <option value="4">Super Admin</option>
                </select>
                {errors.acces && <p className="text-red-500 text-sm">{errors.acces}</p>}
              </div>

              {/* Message d'erreur */}
              {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

              {/* Bouton de soumission */}
              <button
                type="submit"
                className="w-full p-3 mt-4 bg-teal-500 hover:bg-teal-700 text-white font-bold rounded-lg transition-all"
              >
                Créer un compte
              </button>
            </form>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default NewAdmin;
