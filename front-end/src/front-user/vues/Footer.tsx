import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { IonIcon } from "@ionic/react";
import {
  mailOutline,
  callOutline,
  arrowUpOutline,
  logoLinkedin,
  logoFacebook,
  logoTwitter,
} from "ionicons/icons";
import logo from "/image.png";

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const links = [
    { name: "Catalogue", link: "/catalogue" },
    { name: "Calendrier", link: "/calendrier" },
    { name: "Nos Références", link: "/references" },
    { name: "Demande De Formation", link: "/DemandeFormation" },
    { name: "Avis", link: "/avis" },
    { name: "Contact", link: "/contact" },
  ];

  const socialLinks = [
    { icon: logoFacebook, url: "https://facebook.com/sac-consulting" },
    { icon: logoTwitter, url: "https://twitter.com/sac-consulting" },
    { icon: logoLinkedin, url: "https://linkedin.com/company/sac-consulting" },
  ];

  return (
    <footer className="bg-black  text-gray-400 text-title-md  py-6 px-15">
      <div className="max-w-5xl mx-48 flex flex-col md:flex-row justify-between items-start md:items-center gap-40">
        {/* Left Section - Logo + Phrase */}
        <div className="flex-1">
  <div 
    onClick={() => navigate("/")} 
    className="cursor-pointer mb-4 md:mb-0 flex items-start"
  >
    <img 
      src={logo} 
      alt="Logo" 
      className="h-30 md:h-34 w-auto object-contain transition-transform hover:scale-105" 
    />
  </div>
  
</div>

        {/* Center Section - Contacts & Address */}
        <div className="flex flex-col md:flex-row gap-20 flex-[2] text-sm">
          <div>
            <p className="font-semibold text-white mb-1">Informations</p>
            <p>Immeuble GHOMRASSI, 7ème étage</p>
            <p>Monastir - 5000, Tunisie</p>
            <p>Tel: (+216) 52 994 404</p>
            <p>Email: direction@sac-consulting.com</p>
          </div>
          <div>
            <p className="font-semibold text-white mb-1">NOS LIENS</p>
            <ul className="space-y-1">
              {links.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.link}
                    className="hover:text-white transition duration-150"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Section - Réseaux sociaux */}
        <div className="flex flex-col items-start">
          <p className="font-semibold text-white mb-2">
            Suivez-nous
          </p>
          <div className="flex gap-3">
            {socialLinks.map((s, idx) => (
              <a
                key={idx}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-white transition"
              >
                <IonIcon icon={s.icon} className="text-xl" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 mt-6 pt-4 text-center text-xs flex flex-col md:flex-row justify-between items-center">
        <p>© {new Date().getFullYear()} SAC Consulting. Tous droits réservés.</p>
        <a
          href="#top"
          className="mt-2 md:mt-0 hover:text-white flex items-center"
        >
          <span className="mr-1">Haut de page</span>
          <IonIcon icon={arrowUpOutline} />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
