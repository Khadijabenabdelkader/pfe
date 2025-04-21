import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IonIcon } from "@ionic/react";
import { personOutline, cartOutline } from "ionicons/icons";
import logo from "/image.png"; // Utilisation du chemin relatif
import LoginMenu from "./LoginMenu"; // Import LoginMenu
import DropdownUser from "./Dropdowns/DropdownUser"; 
import DropdownCart from "./Dropdowns/DropdownCart";
import { useAuth } from "./Hooks/useAuthUser"; // Import useAuth

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false); // État pour DropdownUser
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false); // État pour DropdownCart
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const Links = [
    { name: "Catalogue", link: "/Catalogue" },
    { name: "Calendrier", link: "/Calendrier" },
    ...(user && !user.isFormateur ? [{ name: "Avis", link: "/avis_formation" }] : []),
    ...(user && !user.isFormateur ? [{ name: "DemanderFormation", link: "/demander_formation" }] : []),
    ...(user && user.isFormateur ? [{ name: "Avis", link: "/avis_formateur" }] : []),
    { name: "Contact", link: "/Footer" },
  ];

  const handleImageClick = () => {
    navigate("/");
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
    setCartDropdownOpen(false); 
  };

  const toggleCartDropdown = () => {
    setCartDropdownOpen(!cartDropdownOpen);
    setUserDropdownOpen(false); 
  };

  // Fermer les dropdowns quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
        setCartDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <>
      <nav className="w-full fixed top-0 left-0 bg-white bg-blur shadow-md z-50">
        <div className="flex justify-between items-center p-4 relative">
          {/* Logo */}
          <div>
            <img
              src={logo}
              alt="Logo"
              className="h-8 w-auto cursor-pointer"
              onClick={handleImageClick}
            />
          </div>

          {/* Mobile Menu Icon */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-2xl text-gray-700"
          >
            <IonIcon icon={personOutline} />
          </button>

          {/* Links */}
          <ul
            className={`md:flex space-x-8 text-lg font-semibold text-gray-700 ${
              isMobileMenuOpen ? "block" : "hidden"
            }`}
          >
            {Links.map((link) => (
              <li key={link.name}>
                <Link to={link.link} className="hover:text-gray-500">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="relative flex items-center" ref={dropdownRef}>
            {user ? (
              <div className="flex items-center">
                <img
                  src={user.avatar || "/default-avatar.png"}
                  className="h-10 w-10 rounded-full object-cover border border-gray-300 cursor-pointer"
                  onClick={toggleUserDropdown}
                />

                {!user.isFormateur && (
                  <IonIcon
                    icon={cartOutline}
                    className="text-2xl text-gray-700 cursor-pointer ml-4"
                    onClick={toggleCartDropdown}
                  />
                )}
              </div>
            ) : (
              <IonIcon
                icon={personOutline}
                className="text-2xl text-gray-700 cursor-pointer md:block"
                onClick={() => setShowLoginMenu(true)} // Ouvrir LoginMenu
              />
            )}

            {userDropdownOpen && (
              <DropdownUser dropdownOpen={userDropdownOpen} toggleDropdown={toggleUserDropdown} />
            )}

            {cartDropdownOpen && !user.isFormateur && (
              <DropdownCart toggleDropdown={toggleCartDropdown} dropdownOpen={cartDropdownOpen} />
            )}
          </div>
        </div>
      </nav>

      {/* Afficher LoginMenu si l'utilisateur n'est pas connecté */}
      {showLoginMenu && !user && <LoginMenu onClose={() => setShowLoginMenu(false)} />}
    </>
  );
};

export default Navbar;
