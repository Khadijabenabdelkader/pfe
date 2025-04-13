import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useAuth } from '../Hooks/useAuthUser';
import LoginMenu from "../LoginMenu";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import generateUniqueCartId from "../Dropdowns/DropdownCart";

interface Session {
  id_session: number;
  theme: string;
  duree: number;
  code: string;
  formateur: string;
  idFichePrg: string | null;

}

interface Formation {
  id_formation: number;
  domaine: string;
  sessions: Session[];
}

const Catalogue: React.FC = () => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionSearchQuery, setSessionSearchQuery] = useState("");
  const [filteredFormations, setFilteredFormations] = useState<Formation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {user, isLoggedIn} = useAuth();
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null); // Ajout de l'ID de session sélectionnée

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_APP_API_URL}/apiUser/formations/Form`)
      .then((response) => {
        setFormations(response.data);
        setFilteredFormations(response.data); // Initialiser filteredFormations avec toutes les formations
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    
  }, []);

  if (loading) return <p className="text-center text-gray-600">Chargement...</p>;
  if (error) return <p className="text-center text-red-500">Erreur: {error}</p>;

  const handleSearchToggle = () => setShowSearchBar(!showSearchBar);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query === "") {
      setFilteredFormations(formations);
      return;
    }
    const filtered = formations.filter((formation) => {
      const matchesDomaine = formation.domaine?.toLowerCase().includes(query) || false;
      const matchesSession = formation.sessions.some((session) => {
        return (
          session.theme?.toLowerCase().includes(query) ||
          session.code?.toLowerCase().includes(query)
        );
      });
      return matchesDomaine || matchesSession;
    });
    setFilteredFormations(filtered);
  };
  const handleAjout = (session: Session) => {
    if (isLoggedIn) {
      const storedCart = localStorage.getItem("cart_${user.id_participant}");
      const cart = storedCart ? JSON.parse(storedCart) : [];
      const storedCartId = localStorage.getItem("currentCartId");
      // Vérifier si un cartId existe, sinon en créer un nouveau
      const cartId = storedCartId ? parseInt(storedCartId) : generateUniqueCartId();
      localStorage.setItem("currentCartId", cartId.toString()); // Garder le cartId inchangé
  
      // Ajouter la session au panier
      const newCartItem = {
        cartId, // Utiliser le cartId existant ou généré
        action: "demander_devis", // Par défaut, on initialise avec une action, vous pouvez la changer selon votre logique
        participant: {
          id_participant: user?.id_participant,
          nom_participant: user?.nom_admin || "",
          email_participant: user?.email || "",
        },
        sessions: [{
          id_session: session.id_session,
          theme: session.theme || "Thème non disponible",
          formateur: session.formateur || "Formateur non disponible",
          code: session.code || "Formateur non disponible",
        }],
      };
  
      // Vérifier si l'item avec le même `cartId` existe déjà et ajouter la session à celui-ci
      const existingCartItem = cart.find(item => item.cartId === cartId);
      if (existingCartItem) {
        existingCartItem.sessions.push(...newCartItem.sessions); // Ajouter la session à un item existant
      } else {
        cart.push(newCartItem); // Ajouter un nouveau panier si aucun n'existe avec ce cartId
      }
  
      // Sauvegarder le panier dans le localStorage
      localStorage.setItem("cart_${user.id_participant}", JSON.stringify(cart));
      console.log("Panier mis à jour", cart);
    } else {
      setShowLoginMenu(true); // Afficher le LoginMenu si l'utilisateur n'est pas connecté
    }
  };
  


  const handleSessionSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSessionSearchQuery(e.target.value);
  
  const handleViewPdf = async (sessionId: number, idFichePrg: string | null) => {
    if (!idFichePrg) {
      alert("Aucune fiche programme disponible.");
      return;
    }

    try {
      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/apiUser/formations/fiche/${idFichePrg}`);
      if (response.data && response.data.chemin) {

        setSelectedPdf(response.data.chemin);
        setSelectedSessionId(sessionId); // Stocker l'ID de la session sélectionnée
        console.log(response.data)      } else {
        alert("Fiche programme non disponible.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du PDF:", error);
      alert("Impossible de charger la fiche programme.");
    }
  };

  // Extraire les domaines uniques des formations filtrées
  const domainesUniques = Array.from(new Set(filteredFormations.map((f) => f.domaine)));

  return (
    <div className="max-w-4xl mx-auto p-4">
      <br /><br /><br /><br /><br />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-teal-700 text-center flex-grow">Catalogue</h1>
        <button onClick={handleSearchToggle} className="bg-white text-[#82b89a] p-2 rounded-full shadow hover:text-black">
          🔍
        </button>
      </div>
      {showLoginMenu && !isLoggedIn && <LoginMenu onClose={() => setShowLoginMenu(false)} />}

      {showSearchBar && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-5">
          <input
            type="text"
            placeholder="Rechercher une formation ou un thème..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full h-10 p-2 border border-black rounded-lg bg-white text-[#82b89a]"
          />
        </motion.div>
      )}

      {domainesUniques.length === 0 ? (
        <p className="text-center text-gray-500 px-4 py-2">Aucune formation trouvée.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {domainesUniques.map((domaine) => {
            const formationsDuDomaine = filteredFormations.filter((f) => f.domaine === domaine);
            return (
              <div key={domaine} className="bg-gray-200 text-black rounded-2xl p-4 shadow-lg transform hover:scale-105 hover:shadow-2xl transition-all cursor-pointer">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-semibold text-teal-600">{domaine}</h3>
                </div>

                <div className="mt-4">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-teal-500 text-white">
                        <th className="p-2 text-left">Thème</th>
                        <th className="p-2 text-left">Code</th>
                        <th className="p-2 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formationsDuDomaine.flatMap((formation) =>
                        formation.sessions.filter((session) => session.theme.toLowerCase().includes(sessionSearchQuery.toLowerCase())).map((session) => (
                          <tr key={session.id_session} className="hover:bg-gray-100">
                            <td className="p-2 border">{session.theme}</td>
                            <td className="p-2 border">{session.code}</td>
                            <td className="p-2 border flex flex-col gap-2">
                            <button
                                onClick={() => handleAjout(session)}
                                className="bg-teal-500 text-white py-1 px-3 rounded-md hover:bg-teal-600"
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? "En cours..." : "Ajouter au panier"}
                              </button>
                              

            {/* Affichage du PDF uniquement pour la session sélectionnée */}
           

                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            );
          })}
          
        </div>
      )}
    </div>
  );
};

export default Catalogue;