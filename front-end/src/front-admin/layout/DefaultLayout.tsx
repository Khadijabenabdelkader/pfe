import React, { useState, ReactNode, useEffect } from 'react';
import Header from '../components/Header/index';
import SidebarSuperAdmin from '../components/Sidebar/SidebarSuperAdmin';
import SidebarAdmin from '../components/Sidebar/SidebarAdmin';
import SignIn from '../pages/Authentication/SignIn';
import { useAuth } from '../hooks/useAuthAdmin';
import { Outlet } from 'react-router-dom';

const DefaultLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, setUser, isLoggedIn, loading } = useAuth(); // Récupérer l'utilisateur et l'état de connexion via le hook useAuth

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const currentTime = Date.now();
        if (userData.expirationTime && userData.expirationTime > currentTime) {
          setUser(userData); // Sauvegarder l'utilisateur si la session est valide
        } else {
          console.log("Session expirée");
          setUser(null); // Supprimer l'utilisateur en cas de session expirée
          localStorage.removeItem('user'); // Nettoyer localStorage
        }
      } catch (error) {
        console.error('Erreur lors du parsing de l\'utilisateur depuis localStorage:', error);
      }
    }
  }, [setUser]);

  // Affichage du contenu uniquement si l'utilisateur est authentifié
  if (loading) {
    return <div>Chargement...</div>; // Afficher un message de chargement pendant l'attente
  }

  // Si l'utilisateur n'est pas connecté, afficher la page de connexion
  if (!isLoggedIn) {
    return <SignIn />;
  }

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      <div className="flex h-screen overflow-hidden">
        {/* Affichage du sidebar selon le type d'utilisateur */}
        {user && (
          <>
            {user.nom_acces === "super_admin" ? (
              <SidebarSuperAdmin sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            ) : (
              <SidebarAdmin sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            )}
          </>
        )}
        
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          
          <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              {/* Rendu du contenu enfant (routes imbriquées) */}
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DefaultLayout;
