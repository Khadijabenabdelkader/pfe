import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Define the type for the client data
interface Client {
  nom_complet: string;
  telephone: string;
  mail: string;
  adresse: string;
  themes: string;
}

const ClientsPersonne = () => {
  const [clients, setClients] = useState<Client[]>([]); // Annotate the clients state with Client[]
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch the data for clients (personnes) from the API
    axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/clients-personnes`)
      .then(response => {
        setClients(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des clients:", error);
        setLoading(false);
      });
  }, []);

  // Filter clients based on the search term
  const filteredClients = clients.filter(client =>
    client.nom_complet.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.telephone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.mail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.adresse.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.themes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Chargement des clients...</div>;

  return (
    <div className="container mx-auto p-6 mt-10 dark:border-strokedark">
      <h1 className="text-3xl font-semibold mb-5">Nos Clients</h1>
      <input
        type="text"
        placeholder="Rechercher un client..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full dark:border-strokedark dark:text-white p-3 mb-6 text-base rounded-lg border dark:border-strokedark focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <table className="min-w-full bg-white border dark:border-strokedark border-gray-300 shadow-md">
        <thead>
          <tr>
            <th className=" py-2 px-4 border-b text-left">Nom</th>
            <th className="py-2 px-4 border-b text-left">Téléphone</th>
            <th className="py-2 px-4 border-b text-left">Email</th>
            <th className="py-2 px-4 border-b text-left">Adresse</th>
            <th className="py-2 px-4 border-b text-left">Sessions</th>
          </tr>
        </thead>
        <tbody>
          {filteredClients.map((client, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border-b">{client.nom_complet}</td>
              <td className="py-2 px-4 border-b">{client.telephone}</td>
              <td className="py-2 px-4 border-b">{client.mail}</td>
              <td className="py-2 px-4 border-b">{client.adresse}</td>
              <td className="py-2 px-4 border-b">{client.theme}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientsPersonne;
