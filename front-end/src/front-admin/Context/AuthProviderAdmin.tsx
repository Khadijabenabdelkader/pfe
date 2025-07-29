import React, { createContext, useState, useEffect } from 'react';

interface User {
  token: string;
  id_admin: number;
  nom_admin: string;
  telephone: number;
  acces: string;
  avatar?: string;
}

export const AuthContext = createContext<any | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = user !== null && user.token !== undefined;

  useEffect(() => {
  const storedUser = localStorage.getItem('user');
  
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      const currentTime = Date.now();

      if (parsedUser.token && parsedUser.expirationTime > currentTime) {
        setUser({
          ...parsedUser,
          avatar: parsedUser.avatar || '/profileFc.jpg'
        });
      } else {
        // Session expirée
        localStorage.removeItem('user');
        setUser(null);
      }
    } catch (error) {
      console.error("Erreur de parsing", error);
      setUser(null);
    }
  }
  setLoading(false);
}, []);

const login = (userData: User) => {
  if (!userData.token) {
    console.error("Token manquant");
    return;
  }

  // Récupérer l'avatar existant si disponible
  const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
  const parsedExistingUser = typeof existingUser === 'string' ? JSON.parse(existingUser) : existingUser;
  
  const userWithData = {
    ...userData,
    avatar: parsedExistingUser.avatar || '/profileFc.jpg'
  };

  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() + 1);
  
  document.cookie = `token=${userData.token}; expires=${expirationDate.toUTCString()}; Path=/; Secure; HttpOnly; SameSite=Strict`;
  
  setUser(userWithData);
  localStorage.setItem('user', JSON.stringify({
    ...userWithData,
    expirationTime: expirationDate.getTime()
  }));
};

const logout = () => {
  setUser(null);
  localStorage.removeItem('user');
  document.cookie = 'token=; Max-Age=-99999999; Path=/; Secure; HttpOnly; SameSite=Strict';
};

  return (
    <AuthContext.Provider value={{ user, setUser, isLoggedIn, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};