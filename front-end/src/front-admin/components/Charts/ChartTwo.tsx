import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ChartTwo: React.FC = () => {
  const [adminStats, setAdminStats] = useState({
    total_admins: 0,
    admins: 0,
    super_admins: 0
  });

  const [sessionStats, setSessionStats] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    admin: true,
    sessions: true
  });
  const [error, setError] = useState({
    admin: '',
    sessions: ''
  });

  useEffect(() => {
    // Fetch admin stats
    axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/stats/admins`)
      .then(response => {
        setAdminStats(response.data.data);
        setLoading(prev => ({ ...prev, admin: false }));
      })
      .catch(err => {
        console.error('Error fetching admin stats:', err);
        setError(prev => ({ ...prev, admin: 'Failed to load admin statistics' }));
        setLoading(prev => ({ ...prev, admin: false }));
      });

    // Fetch session stats
    axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/stats/sessions`)
      .then(response => {
        setSessionStats(response.data.data);
        setLoading(prev => ({ ...prev, sessions: false }));
      })
      .catch(err => {
        console.error('Error fetching session stats:', err);
        setError(prev => ({ ...prev, sessions: 'Failed to load session statistics' }));
        setLoading(prev => ({ ...prev, sessions: false }));
      });
  }, []);

  // Prepare data for the bar chart
  const sessionChartData = sessionStats.map((item, index) => ({
    name: `Semestre ${index + 1}`, // "Semestre 1", "Semestre 2", etc.
    sessions: item.nombre_sessions,
    months: item.mois_concaténés
  }));
  

  // Data for admin pie chart
  const adminChartData = [
    { name: 'Admins', value: adminStats.admins },
    { name: 'Super Admins', value: adminStats.super_admins }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Admin Statistics Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Administrateurs</h2>
        
        {loading.admin ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error.admin ? (
          <div className="text-red-500 text-center py-8">{error.admin}</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Administrateurs</p>
                <p className="text-2xl font-bold text-blue-600">{adminStats.total_admins}</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Super Administrateurs</p>
                <p className="text-2xl font-bold text-green-600">{adminStats.super_admins}</p>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={adminChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {adminChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>

      {/* Session Statistics Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Sessions Publiées</h2>
        
        {loading.sessions ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error.sessions ? (
          <div className="text-red-500 text-center py-8">{error.sessions}</div>
        ) : sessionStats.length === 0 ? (
          <div className="text-gray-500 text-center py-8">Aucune donnée de session disponible</div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Total des groupes de sessions</p>
              <p className="text-2xl font-bold text-purple-600">{sessionStats.length}</p>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
              <BarChart
  data={sessionChartData}
  margin={{ top: 5, right: 30, left: 20, bottom: 50 }} // Ajoute du padding bas
>
                <XAxis 
                    dataKey="name"
                    />
                <YAxis 
                    domain={[0, 'dataMax + 1']}
                    tickCount={Math.max(...sessionChartData.map(d => d.sessions)) + 2}
                    allowDecimals={false}
                  />  
                  <Tooltip 
    content={({ active, payload }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white p-2 border border-gray-200 rounded shadow">
            <p className="font-semibold">{payload[0].payload.name}</p>
            <p>Sessions: {payload[0].value}</p>
            <p>Mois: {payload[0].payload.months}</p>
          </div>
        );
      }
      return null;
    }}
  />
  <Legend />
  <Bar dataKey="sessions" name="Nombre de sessions" fill="#8884d8" />
</BarChart>

              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChartTwo;