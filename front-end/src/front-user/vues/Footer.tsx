import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Assuming you're using React Router for navigation
import { IonIcon } from "@ionic/react";
import axios from "axios"; // Correct import of axios
import { mailOutline, callOutline, arrowUpOutline } from "ionicons/icons";
import logo from "/image.png"; // Utilisation du chemin relatif

const Footer: React.FC = () => {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    message: "",
  });
  const navigate = useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Form Data Submitted:", formData);
  
    try {
      // Envoi des données du formulaire à l'API backend
      const response = await axios.post("http://localhost:5000/apiUser/contact", {
        nom: formData.nom,
        email: formData.email,
        message: formData.message,
      });
      
      console.log(response.data);  // Vous pouvez voir le message de succès ici
      alert("Votre message a été envoyé avec succès !");
      
      // Réinitialisation du formulaire
      setFormData({ nom: "", email: "", message: "" });
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'envoi du message.");
    }
  };
  
  const Links = [
    { name: "Catalogue", link: "/catalogue" },
    { name: "Calendrier", link: "/calendrier" },
    { name: "Nos Références", link: "/references" },
    { name: "Demande De Formation", link: "/DemandeFormation" },
    { name: "Avis", link: "/avis" },
  ];

  const handleImageClick = () => {
    navigate("/");
  };

  return (
    <footer className="bg-gray-800 pt-20 text-white">
      <div className="max-w-6xl flex pt-9 justify-between items-start mx-auto px-6 pt-8">
        {/* Contact Information */}
        <div>
          <div>
            <img
              src={logo}
              alt="Logo"
              className="h-44 w-56"
              onClick={handleImageClick}
            />
          </div>
          <p className="text-white pt-4 my-4">
            <strong>Immeuble GHOMRASSI, 7 ème étage, App. 702</strong>
            <br />
            Monastir - 5000, Tunisie
            <br />
            <span>GSM: (+216) 52 994 404</span>
            <br />
            <span>Tél: (+216) 73 467 357</span>
            <br />
            <span>Fax: (+216) 73 464 382</span>
            <br />
            <span>
              Email:{" "}
              <a href="mailto:direction@sac-consulting.com" className="text-blue-400">
                direction@sac-consulting.com
              </a>
            </span>
          </p>
        </div>

        {/* Footer navigation links */}
        <div className="flex flex-col pt-40">
          <h3 className="text-3xl font-bold text-white mb-4">Sac-consulting</h3>
          {Links.map((link) => (
            <Link
              key={link.name}
              to={link.link}
              className="text-xl text-white hover:text-gray-400 mb-2"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-100 p-4 rounded-md shadow-md w-full max-w-md"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Contactez-nous</h3>
          <div className="mb-4">
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              Nom
            </label>
            <input
              type="text"
              name="nom"
              placeholder="Votre nom"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={formData.nom}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Votre Email"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              Message
            </label>
            <textarea
              name="message"
              placeholder="Votre Message"
              className="w-full p-3 border text-black border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gray-700 text-white font-semibold rounded-md hover:bg-gray-800 active:bg-indigo-700 transition duration-300"
          >
            Envoyer
          </button>
        </form>
      </div>

      {/* Copyright and Social Icons */}
      <div className="text-center my-8">
        <p>Copyright © 2025 Tous droits réservés</p>
        <div className="flex justify-center space-x-6 mt-4">
          <a href="mailto:direction@sac-consulting.com">
            <IonIcon icon={mailOutline} className="text-2xl cursor-pointer" />
          </a>
          <a href="tel:+216733467357">
            <IonIcon icon={callOutline} className="text-2xl cursor-pointer" />
          </a>
          <a href="#top">
            <IonIcon icon={arrowUpOutline} className="text-2xl cursor-pointer" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
