import React from 'react';
import { Navigate } from 'react-router-dom';

// Composant pour protéger les routes
const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const token = localStorage.getItem('token'); // Vérifier si le token existe dans le localStorage

  if (!token) {
    // Si le token n'existe pas, rediriger vers la page de connexion
    return <Navigate to="/" replace />;
  }

  return children; // Si le token est présent, afficher les enfants (la page demandée)
};

export default ProtectedRoute;
