import React from 'react';
import i from "/nexteam.png";
import im from "/elhlel.png";
import ima from "/monatech.png";
import imag from "/somalec.png";
import env from "/enfavet.png";
import be from "/be.png"
import vnh from "/vnh.png";
import sor from "/soromap.png"
import ep from "/ep.png"
import col from "/col.png"
import Footer from "../Footer";
const References = () => {
    
  // Données des entreprises (15x3 = 45 entreprises)
  const entreprises = [
    // Première ligne (15 entreprises)
    { nom: 'Google', logo: i, site: 'https://google.com' },
    { nom: 'Microsoft', logo: im, site: 'https://microsoft.com' },
    { nom: 'Apple', logo: ima, site: 'https://apple.com' },
    { nom: 'Amazon', logo: imag, site: 'https://amazon.com' },
    { nom: 'Facebook', logo: imag, site: 'https://meta.com' },
    { nom: 'ENVAFET', logo: env, site: 'https://tesla.com' },
    { nom: 'BECOTEX', logo:be, site: 'https://netflix.com' },
    { nom: 'VNH', logo: vnh, site: 'https://adobe.com' },
    { nom: 'SOROMAP', logo: sor, site: 'https://intel.com' },
    { nom: 'EPSYLON', logo: ep, site: 'https://ibm.com' },
    { nom: 'COLMAR', logo: col, site: 'https://oracle.com' },
    { nom: 'Samsung', logo: 'https://via.placeholder.com/150x80?text=Samsung', site: 'https://samsung.com' },
    { nom: 'Sony', logo: 'https://via.placeholder.com/150x80?text=Sony', site: 'https://sony.com' },
    { nom: 'HP', logo: 'https://via.placeholder.com/150x80?text=HP', site: 'https://hp.com' },
    { nom: 'Dell', logo: 'https://via.placeholder.com/150x80?text=Dell', site: 'https://dell.com' },
    
    // Deuxième ligne (15 entreprises)
    { nom: 'Airbnb', logo: 'https://via.placeholder.com/150x80?text=Airbnb', site: 'https://airbnb.com' },
    { nom: 'Uber', logo: 'https://via.placeholder.com/150x80?text=Uber', site: 'https://uber.com' },
    { nom: 'Spotify', logo: 'https://via.placeholder.com/150x80?text=Spotify', site: 'https://spotify.com' },
    { nom: 'Twitter', logo: 'https://via.placeholder.com/150x80?text=Twitter', site: 'https://twitter.com' },
    { nom: 'LinkedIn', logo: 'https://via.placeholder.com/150x80?text=LinkedIn', site: 'https://linkedin.com' },
    { nom: 'PayPal', logo: 'https://via.placeholder.com/150x80?text=PayPal', site: 'https://paypal.com' },
    { nom: 'Shopify', logo: 'https://via.placeholder.com/150x80?text=Shopify', site: 'https://shopify.com' },
    { nom: 'Slack', logo: 'https://via.placeholder.com/150x80?text=Slack', site: 'https://slack.com' },
    { nom: 'Zoom', logo: 'https://via.placeholder.com/150x80?text=Zoom', site: 'https://zoom.us' },
    { nom: 'Dropbox', logo: 'https://via.placeholder.com/150x80?text=Dropbox', site: 'https://dropbox.com' },
    { nom: 'Etsy', logo: 'https://via.placeholder.com/150x80?text=Etsy', site: 'https://etsy.com' },
    { nom: 'Reddit', logo: 'https://via.placeholder.com/150x80?text=Reddit', site: 'https://reddit.com' },
    { nom: 'Pinterest', logo: 'https://via.placeholder.com/150x80?text=Pinterest', site: 'https://pinterest.com' },
    { nom: 'TikTok', logo: 'https://via.placeholder.com/150x80?text=TikTok', site: 'https://tiktok.com' },
    { nom: 'Twitch', logo: 'https://via.placeholder.com/150x80?text=Twitch', site: 'https://twitch.tv' },
    
    // Troisième ligne (15 entreprises)
    { nom: 'NVIDIA', logo: im, site: 'https://nvidia.com' },
    { nom: 'AMD', logo: 'https://via.placeholder.com/150x80?text=AMD', site: 'https://amd.com' },
    { nom: 'Qualcomm', logo: 'https://via.placeholder.com/150x80?text=Qualcomm', site: 'https://qualcomm.com' },
    { nom: 'Cisco', logo: 'https://via.placeholder.com/150x80?text=Cisco', site: 'https://cisco.com' },
    { nom: 'VMware', logo: 'https://via.placeholder.com/150x80?text=VMware', site: 'https://vmware.com' },
    { nom: 'Salesforce', logo: 'https://via.placeholder.com/150x80?text=Salesforce', site: 'https://salesforce.com' },
    { nom: 'Workday', logo: 'https://via.placeholder.com/150x80?text=Workday', site: 'https://workday.com' },
    { nom: 'ServiceNow', logo: 'https://via.placeholder.com/150x80?text=ServiceNow', site: 'https://servicenow.com' },
    { nom: 'Atlassian', logo: 'https://via.placeholder.com/150x80?text=Atlassian', site: 'https://atlassian.com' },
    { nom: 'SAP', logo: 'https://via.placeholder.com/150x80?text=SAP', site: 'https://sap.com' },
    { nom: 'Accenture', logo: 'https://via.placeholder.com/150x80?text=Accenture', site: 'https://accenture.com' },
    { nom: 'Deloitte', logo: 'https://via.placeholder.com/150x80?text=Deloitte', site: 'https://deloitte.com' },
    { nom: 'EY', logo: 'https://via.placeholder.com/150x80?text=EY', site: 'https://ey.com' },
    { nom: 'PwC', logo: 'https://via.placeholder.com/150x80?text=PwC', site: 'https://pwc.com' },
    { nom: 'KPMG', logo: 'https://via.placeholder.com/150x80?text=KPMG', site: 'https://kpmg.com' },
  ];

  return (
    <section className="bg-white/90 backdrop-blur-md py-20 px-8 sm:px-10 lg:px-8 border-t border-emerald-100">
      <div className="max-w-7xl mx-auto">
        <br/><br/>
        <h2 className="text-2xl font-bold text-teal-600 text-center flex-grow">NOS REFERENCES</h2>
        <br/><br/>
        {/* Première ligne */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-10 mb-8">
          {entreprises.slice(0, 15).map((entreprise) => (
            <div 
              key={`1-${entreprise.nom}`}
              className="flex flex-col items-center p-4 bg-white rounded-lg shadow-lg hover:shadow-lg transition-shadow duration-300"
            >
              <img 
                src={entreprise.logo} 
                alt={`Logo ${entreprise.nom}`}
                className="h-16 w-auto object-contain mb-3 transition-transform hover:scale-105"
                loading="lazy"
              />
              <h3 className="text-md font-medium text-gray-700 text-center">
                {entreprise.nom}
              </h3>
              <a 
                href={entreprise.site} 
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-600 hover:text-emerald-800 mt-1 hover:underline"
              >
                Visiter le site
              </a>
            </div>
          ))}
        </div>

        {/* Deuxième ligne */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-6 mb-8">
          {entreprises.slice(15, 30).map((entreprise) => (
            <div 
              key={`2-${entreprise.nom}`}
              className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <img 
                src={entreprise.logo} 
                alt={`Logo ${entreprise.nom}`}
                className="h-16 w-auto object-contain mb-3 transition-transform hover:scale-105"
                loading="lazy"
              />
              <h3 className="text-md font-medium text-gray-700 text-center">
                {entreprise.nom}
              </h3>
              <a 
                href={entreprise.site} 
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-600 hover:text-emerald-800 mt-1 hover:underline"
              >
                Visiter le site
              </a>
            </div>
          ))}
        </div>

        {/* Troisième ligne */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-6">
          {entreprises.slice(30, 45).map((entreprise) => (
            <div 
              key={`3-${entreprise.nom}`}
              className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <img 
                src={entreprise.logo} 
                alt={`Logo ${entreprise.nom}`}
                className="h-16 w-auto object-contain mb-3 transition-transform hover:scale-105"
                loading="lazy"
              />
              <h3 className="text-md font-medium text-gray-700 text-center">
                {entreprise.nom}
              </h3>
              <a 
                href={entreprise.site} 
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-600 hover:text-emerald-800 mt-1 hover:underline"
              >
                Visiter le site
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default References;