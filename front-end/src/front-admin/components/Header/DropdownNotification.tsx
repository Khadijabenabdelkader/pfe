import React, { useState, useEffect } from "react";
import { Menu, Transition } from "@headlessui/react";
import { BellIcon } from "@heroicons/react/24/outline";
import { Trash2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuthAdmin";

interface CartItem {
  cartId: number;
  action: "commander" | "demander_devis";
  themes: {
    id_theme: number;
    theme: string;
    code: string;
  }[];
  participant: {
    id_participant: number;
    nom_participant: string;
    email_participant: string;
    tel_participant?: number;
  };
}

const DropdownNotification = () => {
  const [requests, setRequests] = useState<CartItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadNotifications = () => {
      try {
        const storedRequests = localStorage.getItem("globalCart") || "[]";
        const parsedRequests: CartItem[] = JSON.parse(storedRequests);
        
        if (!Array.isArray(parsedRequests)) {
          console.warn("Invalid data format in globalCart");
          localStorage.setItem("globalCart", JSON.stringify([]));
          setRequests([]);
          return;
        }

        // Filtrer et s'assurer que chaque cart a un tableau themes
        const filteredRequests = (user 
          ? parsedRequests.filter(request => 
              request.participant?.id_participant === user.id
            )
          : parsedRequests
        ).map(cart => ({
          ...cart,
          themes: cart.themes || [] // Garantir que themes est toujours un tableau
        }));

        setRequests(filteredRequests);
      } catch (error) {
        console.error("Error loading notifications:", error);
        localStorage.setItem("globalCart", JSON.stringify([]));
        setRequests([]);
      }
    };

    loadNotifications();
  }, [user]);

  const handleAction = async (cartId: number, action: "confirm" | "refuse") => {
    try {
      const cart = requests.find(cart => cart.cartId === cartId);
      if (!cart) return;

      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/commandes/send-email`, 
        {
          subject: action === "confirm" 
            ? "Confirmation de commande" 
            : "Refus de commande",
          body: action === "confirm"
            ? "Votre commande a été confirmée avec succès."
            : "Votre commande a été refusée.",
          email: cart.participant.email_participant,
        }
      );

      if (response.status === 200) {
        const updatedRequests = requests.filter(cart => cart.cartId !== cartId);
        setRequests(updatedRequests);
        localStorage.setItem("globalCart", JSON.stringify(updatedRequests));
      }
    } catch (error) {
      console.error("Error handling action:", error);
      // Fallback: remove from UI even if email fails
      const updatedRequests = requests.filter(cart => cart.cartId !== cartId);
      setRequests(updatedRequests);
      localStorage.setItem("globalCart", JSON.stringify(updatedRequests));
    }
  };

  const handleRemoveItem = (cartId: number) => {
    const updatedRequests = requests.filter(cart => cart.cartId !== cartId);
    setRequests(updatedRequests);
    localStorage.setItem("globalCart", JSON.stringify(updatedRequests));
  };

  // Supprimer les doublons basés sur cartId
  const uniqueRequests = requests.filter(
    (cart, index, self) => index === self.findIndex(t => t.cartId === cart.cartId)
  );

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="relative flex items-center p-2 rounded-full hover:bg-gray-200">
        <BellIcon className="h-6 w-6 text-gray-600" />
        {uniqueRequests.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
            {uniqueRequests.length}
          </span>
        )}
      </Menu.Button>

      <Transition
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 focus:outline-none max-h-96 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Notifications</h3>
            
            {uniqueRequests.length === 0 ? (
              <p className="text-gray-500 text-sm py-2">Aucune notification</p>
            ) : (
              <div className="space-y-3">
                {uniqueRequests.map(cart => (
                  <div key={cart.cartId} className="border-b border-gray-100 pb-3">
                    <div className="mb-2">
                      <h4 className="font-medium text-gray-900">
                        {cart.participant.nom_participant || "Anonyme"}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {cart.participant.email_participant}
                        {cart.participant.tel_participant && ` • ${cart.participant.tel_participant}`}
                      </p>
                    </div>

                    <div className="space-y-2 mb-3">
                      {/* Protection supplémentaire avec cart.themes?.map() */}
                      {cart.themes?.map(theme => (
                        <div key={theme.id_theme} className="bg-gray-50 p-2 rounded">
                          <p className="font-medium text-sm">{theme.theme || "Thème inconnu"}</p>
                          <p className="text-xs text-gray-500">{theme.code || "Code inconnu"}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 capitalize">
                        {cart.action.replace('_', ' ')}
                      </span>
                      
                      <div className="flex space-x-2">
                        {cart.action === "commander" ? (
                          <>
                            <button
                              onClick={() => handleAction(cart.cartId, "confirm")}
                              className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                            >
                              Confirmer
                            </button>
                            <button
                              onClick={() => handleAction(cart.cartId, "refuse")}
                              className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                            >
                              Refuser
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleRemoveItem(cart.cartId)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default DropdownNotification;