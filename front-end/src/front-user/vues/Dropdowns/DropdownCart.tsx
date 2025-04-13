import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingCart } from "lucide-react";
import { useAuth } from "../Hooks/useAuthUser";

interface CartItem {
  cartId: number;
  action: "commander" | "demander_devis";
  participant: {
    nom_participant: string;
    email_participant: string;
    tel_participant: number;
  };
  sessions: {
    id_session: number;
    theme: string;
    date_debut: string;
    date_fin: string;
    formateur: string;
  }[];  
}

const DropdownCart = ({ dropdownOpen }: { dropdownOpen: boolean }) => {
  const [cart, setCart] = useState<CartItem | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Charger le panier depuis localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem("cart_${user.id_participant}");
    if (storedCart) {
      try {
        const parsedCart: CartItem[] = JSON.parse(storedCart);
        if (parsedCart.length > 0) {
          setCart(parsedCart[parsedCart.length - 1]); // Charger uniquement le dernier cart
        }
      } catch (error) {
        console.error("Error parsing cart from localStorage", error);
        setCart(null);
      }
    }
  }, []);
  const isProfileComplete = () => {
    return (
      user?.id_participant &&
      user?.nom_complet &&
      user?.mail &&
      user?.telephone &&
      user?.adresse &&
      user?.nature_participant &&
      (
        // Si c'est une personne, il n'a pas besoin d'infos entreprise
        user.nature_participant === "personne" || 
        // Si c'est une entreprise, il faut les infos entreprise
        (user.nature_participant === "entreprise" && 
          user.nom_entreprise &&
          user.tel_entreprise &&
          user.email_entreprise &&
          user.adr_entreprise)
      )
    );
  };
  
  // Sauvegarder les informations du participant dans localStorage après la connexion
  useEffect(() => {
    if (user) {
      const participantData = {
        nom_participant: user.nom_complet,
        email_participant: user.mail,
        tel_participant: user.telephone,

      };
      localStorage.setItem("participant", JSON.stringify(participantData));
    }
  }, [user]);

  // Supprimer une session du panier
  const handleRemoveItem = (sessionId: number) => {
    if (!cart) return;
    const updatedSessions = cart.sessions.filter(
      (session) => session.id_session !== sessionId
    );
    const updatedCart = { ...cart, sessions: updatedSessions };

    setCart(updatedSessions.length > 0 ? updatedCart : null);
    localStorage.setItem("cart_${user.id_participant}", JSON.stringify(updatedSessions.length > 0 ? [updatedCart] : []));
  };

  // Mettre à jour globalCart dans localStorage
  const updateGlobalCart = (updatedCart: CartItem) => {
    const storedGlobalCart = localStorage.getItem("globalCart");
    const globalCart: CartItem[] = storedGlobalCart ? JSON.parse(storedGlobalCart) : [];
    const newCartId = globalCart.length > 0 ? globalCart[globalCart.length - 1].cartId + 1 : 1;
    updatedCart.cartId = newCartId;

    globalCart.push(updatedCart);
    localStorage.setItem("globalCart", JSON.stringify(globalCart));
  };

  // Passer la commande
  const handleOrder = () => {
    if (!cart || !user) return;
    console.log("Vérification du profil:", isProfileComplete());
  if (!isProfileComplete()) {
    navigate("/profil_participant");
    return;
  }
    // Récupérer les informations du participant
    const participantData = {
      nom_participant: user.nom_complet,
      email_participant: user.mail,
      tel_participant: user.telephone,

    };

    const storedCart = localStorage.getItem("cart_${user.id_participant}");
    const existingCart: CartItem[] = storedCart ? JSON.parse(storedCart) : [];

    // Ensure we keep the same cartId for the current cart
    const updatedCart = {
      ...cart,
      action: "commander",
      participant: participantData, // Ensure participant data is included
      cartId: cart.cartId || (existingCart.length > 0 ? existingCart[existingCart.length - 1].cartId + 1 : 1), // Use existing cartId or generate a new one
    };

    const newCartList = [...existingCart, updatedCart];
    localStorage.setItem("cart_${user.id_participant}", JSON.stringify(newCartList));
    localStorage.setItem("action", "commander");

    // Ajouter le panier au globalCart
    updateGlobalCart(updatedCart);

    setCart(null); // Mettre à jour l'état avec le dernier panier
    localStorage.removeItem("cart_${user.id_participant}"); // Clear the cart from localStorage after order is placed
    console.log("Order placed", updatedCart);
  };

  // Demander un devis
  const handleQuoteRequest = () => {
    if (!cart || !user) return;

    console.log("Vérification du profil:", isProfileComplete());
    if (!isProfileComplete()) {
      navigate("/profil_participant");
      return;
    }
    // Récupérer les informations du participant
    const participantData = {
      nom_participant: user.nom_complet,
      email_participant: user.mail,
      tel_participant: user.telephone,

    };

    const storedCart = localStorage.getItem("cart_${user.id_participant}");
    const existingCart: CartItem[] = storedCart ? JSON.parse(storedCart) : [];

    // Ensure we keep the same cartId for the current cart
    const updatedCart = {
      ...cart,
      action: "demander_devis",
      participant: participantData, // Ensure participant data is included
      cartId: cart.cartId || (existingCart.length > 0 ? existingCart[existingCart.length - 1].cartId + 1 : 1), // Use existing cartId or generate a new one
    };

    const newCartList = [...existingCart, updatedCart];
    localStorage.setItem("cart_${user.id_participant}", JSON.stringify(newCartList));
    localStorage.setItem("action", "demander_devis");

    // Ajouter le panier au globalCart
    updateGlobalCart(updatedCart);

    setCart(updatedCart); // Mettre à jour l'état avec le dernier panier
    console.log("Quote request", updatedCart);
  };

  return (
    <div
      className={`absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 
        transition-transform duration-200 ease-out transform ${dropdownOpen ? "opacity-100 scale-100 translate-y-2" : "opacity-0 scale-95 pointer-events-none"}`}
    >
      <div className="bg-white shadow-lg rounded-lg p-4 min-h-[200px] flex flex-col">
        {!cart || cart.sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-500 h-full">
            <ShoppingCart size={50} className="text-gray-300 mb-3" />
            <p className="text-sm">Votre panier est vide</p>
            <Link to="/Catalogue" className="mt-4">
              <button className="bg-gray-700 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition">
                Retour au catalogue
              </button>
            </Link>
          </div>
        ) : (
          cart.sessions.map((session) => (
            <div key={session.id_session} className="flex justify-between items-center mb-3 border-b pb-2">
              <div>
                <p className="font-medium">{session.theme}</p>
                
              </div>
              <button
                onClick={() => handleRemoveItem(session.id_session)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
        {cart && cart.sessions.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={handleOrder}
              className="bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600 transition duration-300 w-full"
            >
              Passer la commande
            </button>
            <button
              onClick={handleQuoteRequest}
              className="bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600 transition duration-300 w-full"
            >
              Demande de devis
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DropdownCart;
