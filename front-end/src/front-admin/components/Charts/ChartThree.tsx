import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface SessionData {
  theme: string;
  nombre_participants: number;
}

const ChartThree: React.FC = () => {
  const [data, setData] = useState<SessionData[]>([]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_APP_API_URL}/api/sessions-populaires`)
      .then(response => {
        console.log("Données reçues du backend :", response.data);
        
        // Vérifie si les données ont le bon format
        if (Array.isArray(response.data)) {
          setData(response.data);
        } else {
          console.error("Format de données inattendu :", response.data);
          setData([]);
        }
      })
      .catch(error => {
        console.error("Erreur lors du chargement des données :", error);
      });
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold text-center mb-4">Sessions les plus demandées</h2>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" />
          <YAxis dataKey="theme" type="category" width={150} />
          <Tooltip />
          <Bar dataKey="nombre_participants" fill="#e74c3c" barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartThree;
