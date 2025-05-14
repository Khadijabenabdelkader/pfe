import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Fonction pour convertir les notes en libellés
const getEvaluationLabel = (note) => {
  switch(Math.round(note)) {
    case 1: return 'Insuffisant';
    case 2: return 'Peu satisfaisant';
    case 3: return 'Satisfaisant';
    case 4: return 'Très satisfaisant';
    case 5: return 'Excellent';
    default: return 'Non évalué';
  }
};

const ChartOne = () => {
 /* const [sessions, setSessions] = useState<{ id_session: number }[]>([]);
  const [sessionAvis, setSessionAvis] = useState<{ id_session: number; moyenne_note: number; moyenne_adaptation: number; moyenne_pedagogie: number; moyenne_satisfaction: number; nombre_avis: number; }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/avis/sessions/with-averages`);
        
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Données reçues invalides');
        }
        
        setSessionAvis(response.data);
        setSessions(response.data.map(s => ({ id_session: s.id_session })));
        
      } catch (error) {
        console.error('Fetch error:', error);
        setError(error.message);
        setSessionAvis([]);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Préparation des données pour le graphique
  const chartData = {
    labels: sessions.map(session => `Session ${session.id_session}`),
    datasets: [
      {
        label: 'Note globale moyenne',
        data: sessionAvis.map(session => session.moyenne_note || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Adaptation programme',
        data: sessionAvis.map(session =>session.moyenne_adaptation || 0),
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: 'Moyens pédagogiques',
        data: sessionAvis.map(session => session.moyenne_pedagogie || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Satisfaction',
        data: sessionAvis.map(session => session.moyenne_satisfaction|| 0),
        backgroundColor: 'rgba(153, 102, 255, 0.7)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Comparaison des évaluations moyennes par session',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.raw;
            return `${label}: ${value} (${getEvaluationLabel(value)})`;
          },
          afterBody: function(context) {
            const sessionIndex = context[0].dataIndex;
            return `Nombre d'avis: ${sessionAvis[sessionIndex]?.nombre_avis || 0}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        ticks: {
          callback: function(value) {
            return getEvaluationLabel(Math.round(value));
          },
          stepSize: 1
        },
        
        title: {
          display: true,
          text: 'Niveau de satisfaction'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Sessions de formation'
        }
      }
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Analyse comparative des sessions</h1>
      
      {error && (
        <div className="alert alert-danger">{error}</div>
      )}
      
      {loading ? (
        <div className="text-center">Chargement des données...</div>
      ) : (
        <>
          <div className="mb-5" style={{ height: '500px', position: 'relative' }}>
            {sessionAvis.length > 0 ? (
              <Bar 
                data={chartData} 
                options={options}
                redraw
              />
            ) : (
              <div className="text-center">Aucune donnée disponible</div>
            )}
          </div>

          <div className="mb-5">
            <h2>Détails par session</h2>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>Note globale</th>
                    <th>Adaptation</th>
                    <th>Pédagogie</th>
                    <th>Satisfaction</th>
                    <th>Nombre d'avis</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionAvis.map((session) => (
                    <tr key={session.id_session}>
                      <td>Session {session.id_session}</td>
                      <td>
                        {session.moyenne_note} 
                        <small className="text-muted"> ({getEvaluationLabel(session.moyenne_note)})</small>
                      </td>
                      <td>
                        {session.moyenne_adaptation}
                        <small className="text-muted"> ({getEvaluationLabel(session.moyenne_adaptation)})</small>
                      </td>
                      <td>
                        {session.moyenne_pedagogie}
                        <small className="text-muted"> ({getEvaluationLabel(session.moyenne_pedagogie)})</small>
                      </td>
                      <td>
                        {session.moyenne_satisfaction}
                        <small className="text-muted"> ({getEvaluationLabel(session.moyenne_satisfaction)})</small>
                      </td>
                      <td>{session.nombre_avis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );*/
};

export default ChartOne;