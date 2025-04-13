// useAuth.tsx
import { useContext } from 'react';
import { AuthContext } from '../Context/AuthProviderAdmin';

// Hook personnalisé pour accéder aux données d'authentification
export const useAuth = () => {
  return useContext(AuthContext);
};
