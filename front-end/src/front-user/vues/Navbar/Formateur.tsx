import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const Formateur: React.FC = () => {
  const [formateurs, setFormateurs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [editingFormateur, setEditingFormateur] = useState<any | null>(null);

  useEffect(() => {
    const fetchFormateurs = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/apiUser/formateurs`);
        setFormateurs(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des formateurs:', error);
      }
    };
    fetchFormateurs();
  }, []);

  const handleSearchToggle = () => {
    setShowSearchBar(!showSearchBar);
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${import.meta.env.VITE_APP_API_URL}/apiUser/formateurs/${id}`);
      setFormateurs(formateurs.filter((formateur) => formateur.id_formateur !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression du formateur:', error);
    }
  };

  const handleEditClick = (formateur: any) => {
    setEditingFormateur({ ...formateur });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingFormateur) return;
    setEditingFormateur({ ...editingFormateur, [e.target.name]: e.target.value });
  };

  const handleConfirmEdit = async () => {
    try {
      console.log('Données envoyées au serveur :', editingFormateur);
      const response = await axios.put(
        `${import.meta.env.VITE_APP_API_URL}/apiUser/formateurs/${editingFormateur.id_formateur}`,
        editingFormateur
      );
      console.log('Réponse du serveur :', response.data);

      if (response.status === 200) {
        console.log('Formateur modifié avec succès');
        setFormateurs(formateurs.map(f => 
          f.id_formateur === editingFormateur.id_formateur ? editingFormateur : f
        ));
        setEditingFormateur(null);
      } else {
        console.log('Erreur lors de la modification du formateur');
      }
    } catch (error) {
      console.error('Erreur lors de la modification du formateur:', error);
      console.log('Une erreur est survenue lors de la modification du formateur');
    }
  };

  const filteredFormateurs = formateurs.filter((formateur) =>
    (formateur.nom_complet && formateur.nom_complet.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (formateur.competences && formateur.competences.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (formateur.themes_a_enseigner && formateur.themes_a_enseigner.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (formateur.mail && formateur.mail.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (formateur.adr && formateur.adr.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (formateur.tel && formateur.tel.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-8 pt-20 min-h-screen bg-gray-100">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Liste des Formateurs</h1>
        <button onClick={handleSearchToggle} className="bg-white text-blue-700 p-2 rounded-full shadow hover:text-black">
          🔍
        </button>
      </div>
      

      {showSearchBar && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-5">
          <input
            type="text"
            placeholder="Rechercher un formateur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 p-2 border border-black rounded-lg bg-white text-gray-700"
          />
        </motion.div>
      )}
      <button className="bg-blue-700 text-white px-6 py-3 mt-8 rounded-lg hover:bg-blue-900" onClick={() => window.location}>
        Ajouter Formateur
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFormateurs.length === 0 ? (
          <p className="text-center">Aucun formateur trouvé</p>
        ) : (
          filteredFormateurs.map((formateur) => (
            <motion.div
              key={formateur.id_formateur}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-200 text-black rounded-2xl p-4 shadow-lg transform hover:scale-105 hover:shadow-2xl transition-all"
            >
              <div>
                <img
                  src={formateur.photo || 'https://via.placeholder.com/150'}
                  alt={formateur.nom_complet}
                  className="w-full h-40 object-cover rounded-xl mb-3"
                />
                <h2 className="text-xl font-bold mb-2">{formateur.nom_complet}</h2>
                <p>Email: {formateur.mail}</p>
                <p>Adresse: {formateur.adr}</p>
                <p>Compétences: {formateur.competences}</p>
                <p>Thèmes à enseigner: {formateur.themes_a_enseigner}</p>
                <p>Tarif journalier: {formateur.tarif_journalier} €</p>
                <p>Nombre de formations: {formateur.nb_formations}</p>
                <p>Téléphone: {formateur.tel}</p>

                <div className="flex gap-4 mt-4">
                  <button className="bg-blue-700 text-white px-4 py-2 rounded-xl hover:bg-blue-900" onClick={() => handleEditClick(formateur)}>Modifier</button>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-800" onClick={() => handleDelete(formateur.id_formateur)}>Supprimer</button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {editingFormateur && (
        <motion.div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-xl shadow-xl z-50 w-full max-w-2xl overflow-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-2xl mb-4 text-center">Modifier Formateur</h2>
          <div className="space-y-4">
            <div>
              <label className="block font-semibold">Nom complet:</label>
              <input
                type="text"
                name="nom_complet"
                value={editingFormateur.nom_complet}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold">Email:</label>
              <input
                type="email"
                name="mail"
                value={editingFormateur.mail}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold">Adresse:</label>
              <input
                type="text"
                name="adr"
                value={editingFormateur.adr}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold">Compétences:</label>
              <textarea
                name="competences"
                value={editingFormateur.competences}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold">Thèmes à enseigner:</label>
              <textarea
                name="themes_a_enseigner"
                value={editingFormateur.themes_a_enseigner}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold">Tarif journalier:</label>
              <input
                type="number"
                name="tarif_journalier"
                value={editingFormateur.tarif_journalier}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold">Téléphone:</label>
              <input
                type="text"
                name="tel"
                value={editingFormateur.tel}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex justify-between mt-6">
              <button onClick={handleConfirmEdit} className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-900">Confirmer</button>
              <button onClick={() => setEditingFormateur(null)} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-800">Annuler</button>
            </div>
          </div>
        </motion.div>
      )}

      
    </div>
  );
};

export default Formateur;