import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuthAdmin'; // Assurez-vous d'importer le hook useAuth

const SignOut = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fonction de déconnexion
    const handleLogout = () => {
      // Supprimer le token du cookie en définissant une date d'expiration passée
      document.cookie = 'token=; Max-Age=-99999999; Path=/; Secure; HttpOnly; SameSite=Strict';

      // Supprimer l'utilisateur du localStorage
      localStorage.removeItem('user');

      // Appeler la fonction de logout du context
      logout();

      // Rediriger l'utilisateur vers la page de connexion ou une autre page appropriée
      navigate('/Admin/signin');
    };

    handleLogout();
  }, [logout, navigate]);

};

export default SignOut;
