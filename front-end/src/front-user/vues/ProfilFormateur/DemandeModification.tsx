import React, { useState } from 'react';
import axios from 'axios';
interface DemandeModificationProps {
  onClose: () => void;
}
const DemandeModification: React.FC<DemandeModificationProps> = ({ onClose }) => {
  // Récupérer les données utilisateur depuis localStorage
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const nomFormateur = userData.nom_complet || '';

  const [formData, setFormData] = useState({
    email: '',
    telephone: '',
    nouveauxDonnes: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('telephone', formData.telephone);
      formDataToSend.append('nouveauxDonnes', formData.nouveauxDonnes);
      formDataToSend.append('nomFormateur', nomFormateur);
      formDataToSend.append('email', formData.email);

      files.forEach(file => {
        formDataToSend.append('fichiers', file);
      });

      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/apiUser/modification`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: ` Bearer ${userData.token}`,
          },
        }
      );

      if (response.status === 200) {
        alert('Demande envoyée avec succès!');
        setFormData(prev => ({
          ...prev,
          telephone: '',
          nouveauxDonnes: ''
        }));
        setFiles([]);
      }        setFiles([]);
      }
     catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de l\'envoi de la demande');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center text-teal-500 mb-4">Demande de Modification</h1>
      
      <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
        <p>Formateur: <strong>{nomFormateur}</strong></p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="telephone" className="block text-lg font-semibold">Téléphone</label>
          <input
            type="text"
            id="telephone"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            className="mt-2 px-4 py-2 border border-gray-300 rounded-md w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-lg font-semibold">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-2 px-4 py-2 border border-gray-300 rounded-md w-full bg-gray-100"
          />
        </div>
        <div>
          <label htmlFor="nouveauxDonnes" className="block text-lg font-semibold">Nouvelles données</label>
          <textarea
            id="nouveauxDonnes"
            name="nouveauxDonnes"
            value={formData.nouveauxDonnes}
            onChange={handleChange}
            className="mt-2 px-4 py-2 border border-gray-300 rounded-md w-full h-32"
            required
          />
        </div>

        <div>
          <label htmlFor="fichiers" className="block text-lg font-semibold">
            Fichiers joints (PDF, images)
            <span className="text-sm text-gray-500 ml-2">(Optionnel, multiple autorisé)</span>
          </label>
          <input
            type="file"
            id="fichiers"
            name="fichiers"
            multiple
            onChange={handleFileChange}
            className="mt-2 px-4 py-2 border border-gray-300 rounded-md w-full"
            accept=".pdf,.jpg,.jpeg,.png"
          />
          {files.length > 0 && (
            <div className="mt-2">
              <p className="text-sm">Fichiers sélectionnés:</p>
              <ul className="list-disc pl-5">
                {files.map((file, index) => (
                  <li key={index}>{file.name} ({Math.round(file.size / 1024)} KB)</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex justify-between mt-4">

        <div className="text-left">
          <br/>
          <button
            type="submit"
            className="px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition disabled:bg-teal-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande'}
        </button> </div>
        <div className="text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition"
          >
            Annuler
          </button>
        </div></div>

      </form>
    </div>
  );
};

export default DemandeModification;