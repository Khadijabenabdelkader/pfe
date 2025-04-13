import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./front-user/AppUser"; // Exemple de page utilisateur
import AdminPage from "./front-admin/AppAdmin"; // Page admin
import { AuthProvider as AuthProviderUser } from './front-user/vues/Context/AuthProviderUser'; // Auth pour utilisateurs
import { AuthProvider as AuthProviderAdmin } from './front-admin/Context/AuthProviderAdmin'; 

function App() {
  return (
    <Router  >
      <Routes>
        {/* Route pour l'utilisateur classique */}
        <Route 
          path="/*" 
          element={
            <AuthProviderUser>
              <HomePage />
            </AuthProviderUser>
          }
        />

        {/* Route pour l'administrateur */}
        <Route 
          path="/Admin/*" 
          element={
            <AuthProviderAdmin>
              <AdminPage />
            </AuthProviderAdmin>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
