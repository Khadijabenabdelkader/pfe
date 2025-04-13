import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const ChartTwo: React.FC = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_APP_API_URL}/api/participants-stats`)
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error("Erreur lors du chargement des données :", error);
      });
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold text-center mb-4">Nombre de Participants par Type</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="nature_participant" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="nombre_participants" fill="#3498db" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartTwo;
