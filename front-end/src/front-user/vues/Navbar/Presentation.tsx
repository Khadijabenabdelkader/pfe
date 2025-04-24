

import React, { useState } from "react";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import img from "/enfavet.png";
import i from "/nexteam.png";
import im from "/elhlel.png";
import ima from "/monatech.png";
import imag from "/somalec.png";
import image from "/n.png"
import Footer from "../Footer";

// Composant CountUp observable
const ObservableCountUp = ({ end, duration = 2, ...props }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
    rootMargin: '-50px 0px',
  });

  return (
    <span ref={ref}>
      {inView ? (
        <CountUp end={end} duration={duration} {...props} />
      ) : (
        <span>0</span>
      )}
    </span>
  );
};

const Presentation: React.FC = () => {
  const [values] = useState({
    plansDeFormation: 300,
    anneesExperience: 22,
    partenaires: 120,
    clients: 74,
    etudesMan: 35,
  });
  const Links = [
    { name: "CATALOGUE", link: "/Catalogue" },
    { name: "Calendrier", link: "/Calendrier" },
  ]


  const entreprises = [
    { 
      nom: "Enfavet", 
      logo: img, 
      site: "http://www.made-in-tunisia.net/vitrine/contact.php?tc1=lKmSnKmV" 
    },
    { 
      nom: "NEXTEAM", 
      logo: i, 
      site: "https://www.nexteam-group.com/en/" 
    },
    { 
      nom: "El HLEL", 
      logo: im, 
      site: "https://ween.tn/fiche/el-hilel-3311" 
    },
    { 
      nom: "MONATECH", 
      logo: ima, 
      site: "https://www.sac-consulting.com/nos-references/monatech" 
    },
    { 
      nom: "SOMALEC", 
      logo: imag, 
      site: "https://www.aqle.fr/fr/parcours_client/somalec/" 
    },
  ];
  const lien = [
    { 
      name: "Catalogue",
      lien:"/catalogue",
    },
    { 
      name: "Caendrier",
      lien: "/calendrier", 
    },];

  return (
    <div className="relative min-h-screen ">
      <div className="relative z-10 h-full overflow-y-auto">
        <div className="text-center text-emrald-500 pt-20 pb-12 px-6">
        
          <div className="fixed inset-0 z-[-1] overflow-hidden">
 <br/><br/>
  <div className="h-[calc(130vh-80px)] blur-sm w-full bg-black flex items-center justify-center p-1 z-[-1]">
    <img 
      src={image} 
      alt=""
      className="h-full w-auto max-w-none filter"
      style={{ minWidth: '100vw' }}
    />
  </div>
</div>
          
            {/*<div className="text-4xl font-semibold text-center my-0 text-emerald-500/80 mb-8">*/}
            <div className="text-4xl font-semibold text-center text-emerald-500/80 mt-[-5.5rem] mb-4">           

           
            <h1 className="text-6xl backdrop-blur-sm bg-black/5 font-bold text-center  text-white/100 mb-20  rounded-lg ">
                Sac-consulting
              </h1><br/>
              <p className="font-light text-2xl text-white mx-auto backdrop-blur-sm bg-black/5 p-6 rounded-lg leading-relaxed">
    Découvrez des services sur-mesure pour votre entreprise dans les domaines de la formation, 
    la certification et la mise à niveau des compétences. Notre engagement : accompagner 
    le développement durable de votre performance organisationnelle, renforcer votre avantage 
    concurrentiel et soutenir votre croissance rentable à long terme.
</p>
            </div>
          
          <div className="relative mt-8">
            <div className="rounded-xl overflow-hidden shadow-lg">
              <div className="bg-emerald-400/70 backdrop-blur-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  {[
                    { value: values.plansDeFormation, title: "Plans de Formation" },
                    { title: "Années d'expérience", value: values.anneesExperience },
                    { title: "Partenaires", value: values.partenaires },
                    { title: "Clients", value: values.clients },
                    { title: "Etudes Man", value: values.etudesMan },
                  ].map((item) => (
                    <div key={item.title}  className="h-32 flex flex-col items-center justify-center" >
                     
                      <p className="text-white text-3xl font-bold">
                        <ObservableCountUp end={item.value} duration={3} />
                      </p>
                      <h2 className="text-xl font-semibold text-white text-center">
                        {item.title}
                      </h2>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-md p-8 border-t border-emerald-100">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                  {entreprises.map((entreprise) => (
                    <div 
                      key={entreprise.nom} 
                      className="flex flex-col items-center"
                    >
                      <img 
                        src={entreprise.logo} 
                        alt={`Logo ${entreprise.nom}`}
                        className="h-20 w-auto object-contain mb-2 transition-transform hover:scale-110"
                      />
                      <h3 className="text-lg font-semibold text-gray-700 text-center">
                        {entreprise.nom}
                      </h3>
                      <a 
                        href={entreprise.site} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-emerald-600 hover:text-emerald-800 mt-1 hover:underline"
                      >
                        Visiter le site
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-8 border-t border-emerald-100 mt-8 relative overflow-hidden">
            <div className="w-full h-64 mb-8 overflow-hidden rounded-t-lg">
              <img 
                src="/presUI.png" 
                alt="Nos prestations" 
                className="w-full h-full object-cover object-center"
              />
            </div>

            <h2 className="text-4xl font-semibold text-center my-12 text-emerald-600/80 mb-8">
              Nos Prestations Remboursables par l'état jusqu'à
              <p className="text-emerald-600/80 text-3xl font-bold mt-4">
                <ObservableCountUp end={70} duration={3} />% !
              </p>  
            </h2>
            
            <div className="flex flex-wrap justify-center gap-8">
              {[
                "✔️ Mise à niveau",
                "✔️ Certification ISO (9001, 14001, 18001, SA 8000..)",
                "✔️ Formation et assistance technique",
                "✔️ Recrutement",
                "✔️ Audit qualité",
                "✔️ Audit Social"
              ].map((item) => (
                <h3 key={item} className="text-xl font-semibold text-gray-700">
                  {item}
                </h3>
              ))}
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md p-8 border-t border-emerald-100 mt-8">
          <div className="w-full h-64 mb-8 overflow-hidden rounded-t-lg">
              <img 
                src="/ui2.jpg" 
                alt="Nos prestations" 
                className="w-full h-full object-cover object-center"
              />
            </div>
            <h2 className="text-4xl font-semibold text-center my-12 text-emerald-600/80 mb-8">
              Nos Points forts au niveau de la formation
            </h2>
            
            <div className="flex flex-wrap justify-center gap-8">
              {[
                "✔️ Planification",
                "✔️ Certification",
                "✔️ Encadrement et suivi",
                "✔️ Application"
              ].map((item) => (
                <h3 key={item} className="text-lg font-semibold text-gray-700">
                  {item}
                </h3>
              ))}
            </div>
          </div>
          

          <div className="bg-white/90 backdrop-blur-md p-8 border-t border-emerald-100 mt-8">
          <div className="w-full h-64 mb-8 overflow-hidden rounded-t-lg">
              <img 
                src="/catalogueUI.png" 
                alt="Nos prestations" 
                className="w-full h-full object-cover object-center"
              />
            </div>
            <h2 className="text-4xl font-semibold text-center my-12 text-emerald-600/80 mb-8">
              Explorez notre Catalogue !            </h2>
            
                      <a 
                        href="/catalogue" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-emerald-600 hover:text-emerald-800 mt-1 hover:underline"
                      >
                        Consultez le catalogue
                      </a>
          </div>
          <div className="bg-white/90 backdrop-blur-md p-8 border-t border-emerald-100 mt-8">
          <div className="w-full h-64 mb-8 overflow-hidden rounded-t-lg">
              <img 
                src="/calendarUI.png" 
                alt="Nos prestations" 
                className="w-full h-full object-cover object-center"
              />
            </div>
            <h2 className="text-4xl font-semibold text-center my-12 text-emerald-600/80 mb-8">
              Trouvez plein de formations dans notre Calendrier !            </h2>
            
              <a 
                        href="/calendrier"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-emerald-600 hover:text-emerald-800 mt-1 hover:underline"
                      >
                        Consultez la calendrier
                      </a>
          </div><br/><br/><br/><br/>
          < ul className=" mt-auto w-full">
      <Footer/>
      </ul>

        </div> 
     </div>
     
     
    </div>
  );
};

export default Presentation;
