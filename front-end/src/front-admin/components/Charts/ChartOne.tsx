import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";

const ChartOne: React.FC = () => {
  const [sessionsData, setSessionsData] = useState([]);
  const [avisData, setAvisData] = useState([]);

  useEffect(() => {
    // Récupérer le nombre de sessions par formateur
    axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/sessions-stats`)
      .then(response => {
        console.log("Données des sessions:", response.data);  // Ajoutez ce log
        setSessionsData(response.data);
      })
      .catch(error => console.error("Erreur chargement des sessions:", error));
  
    // Récupérer le nombre d'avis par mois
    axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/avis-stats`)
      .then(response => {
        console.log("Données des avis:", response.data);  // Ajoutez ce log
        setAvisData(response.data);
      })
      .catch(error => console.error("Erreur chargement des avis:", error));
  }, []);
  

  return (
    <div className="p-6 grid gap-6 md:grid-cols-2">
      {/* Graphique des sessions par formateur */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold text-center mb-4">Nombre de Sessions par Formateur</h2>
        <ResponsiveContainer width="100%" height={300}>
        {sessionsData && sessionsData.length > 0 ? (
  <BarChart data={sessionsData}>
    <XAxis dataKey="nom_formateur" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar dataKey="nombre_sessions" fill="#8884d8" />
  </BarChart>
) : (
  <p>Aucune donnée disponible pour afficher ce graphique.</p>
)}

</ResponsiveContainer>

      </div>

      {/* Graphique des avis par mois */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold text-center mb-4">Nombre d'Avis par Mois</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={avisData}>
            <XAxis dataKey="mois" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="nombre_avis" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartOne;
