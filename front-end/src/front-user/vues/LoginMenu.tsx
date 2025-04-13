import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./Hooks/useAuthUser";

interface LoginMenuProps {
  onClose: () => void;
}

const LoginMenu: React.FC<LoginMenuProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Formulaires
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    reset: resetLogin,
  } = useForm();

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    reset: resetSignup,
  } = useForm();

  const {
    register: registerPasswordChange,
    handleSubmit: handlePasswordChangeSubmit,
    reset: resetPasswordChange,
  } = useForm();

  // Expressions régulières pour validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Gestion du clic en dehors du modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Fonction pour la connexion
  const onLogin = async (data: any) => {
    try {
      setError(null);
      const bodyData = { nom_complet: data.nom_complet, pwd: data.pwd };

      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/apiUser/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(bodyData),
      });

      const result = await response.json();
      
      if (!response.ok) throw new Error(result.message || "Erreur de connexion");
      if (result.token) {
        login(result);
        resetLogin();
        onClose();
        if (result.isFormateur) {
          navigate("/profil_formateur");
        } 
      } else {
        throw new Error("Le token est manquant dans la réponse.");
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Fonction pour l'inscription
  const onSignup = async (data: any) => {
    const { pwd, mail } = data;

    if (!emailRegex.test(mail)) {
      setError("L'email fourni est invalide.");
      return;
    }

    if (!passwordRegex.test(pwd)) {
      setError("Le mot de passe doit comporter au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.");
      return;
    }

    try {
      setError(null);
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/apiUser/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Erreur d'inscription");

      resetSignup();
      onClose();
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Fonction pour modifier le mot de passe
  const onChangePassword = async (data: any) => {
    try {
      setError(null);
      
      // Vérification que les nouveaux mots de passe correspondent
      if (data.newPassword !== data.confirmPassword) {
        throw new Error("Les nouveaux mots de passe ne correspondent pas.");
      }

      // Validation du nouveau mot de passe
      if (!passwordRegex.test(data.newPassword)) {
        throw new Error("Le nouveau mot de passe doit comporter au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.");
      }

      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/apiUser/change-password`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          oldPassword: data.oldPassword,
          newPassword: data.newPassword
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Erreur lors du changement de mot de passe");

      // Réinitialiser et revenir au formulaire de connexion
      resetPasswordChange();
      setIsChangingPassword(false);
      setError(null);
      alert("Mot de passe modifié avec succès !");

    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white p-8 w-full max-w-3xl rounded-lg shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-2xl font-bold text-gray-700 hover:text-red-500"
        >
          &times;
        </button>

        {!isChangingPassword ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Section Connexion */}
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Se Connecter</h2>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
                <div>
                  <label className="block text-gray-700">Nom</label>
                  <input
                    {...registerLogin("nom_complet")}
                    type="text"
                    placeholder="Nom"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Mot de passe</label>
                  <input
                    {...registerLogin("pwd")}
                    type="password"
                    placeholder="Mot de passe"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-gray-700 text-white font-semibold rounded-md hover:bg-gray-800">
                  Se Connecter
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsChangingPassword(true)}
                  className="w-full py-2 text-gray-700 font-semibold rounded-md hover:underline"
                >
                  Modifier Mot de passe
                </button>
              </form>
            </div>

            {/* Section Inscription */}
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">S'inscrire</h2>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <form onSubmit={handleSignupSubmit(onSignup)} className="space-y-4">
                <div>
                  <label className="block text-gray-700">Nom</label>
                  <input
                    {...registerSignup("nom_complet")}
                    type="text"
                    placeholder="Nom"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Email</label>
                  <input
                    {...registerSignup("mail")}
                    type="email"
                    placeholder="Adresse Email"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Mot de passe</label>
                  <input
                    {...registerSignup("pwd")}
                    type="password"
                    placeholder="Mot de passe"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-gray-700 text-white font-semibold rounded-md hover:bg-gray-800">
                  S'inscrire
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Modifier Mot de passe</h2>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            
            <form onSubmit={handlePasswordChangeSubmit(onChangePassword)} className="space-y-4">
              <div>
                <label className="block text-gray-700">Nom</label>
                <input
                  {...registerPasswordChange("nom_complet")}
                  type="text"
                  placeholder="Nom"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Email</label>
                <input
                  {...registerPasswordChange("mail")}
                  type="email"
                  placeholder="Adresse Email"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Ancien Mot de passe</label>
                <input
                  {...registerPasswordChange("oldPassword")}
                  type="password"
                  placeholder="Ancien mot de passe"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Nouveau Mot de passe</label>
                <input
                  {...registerPasswordChange("newPassword")}
                  type="password"
                  placeholder="Nouveau mot de passe"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Confirmer Nouveau Mot de passe</label>
                <input
                  {...registerPasswordChange("confirmPassword")}
                  type="password"
                  placeholder="Confirmer nouveau mot de passe"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              
              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsChangingPassword(false)}
                  className="flex-1 py-2 bg-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-400"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-gray-700 text-white font-semibold rounded-md hover:bg-gray-800"
                >
                  Modifier
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginMenu;