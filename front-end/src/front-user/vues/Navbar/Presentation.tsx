import React, { useState } from "react";
import { useSpring, animated } from "react-spring";
import CountUp from "react-countup";

import image from "/image.png";

const Presentation: React.FC = () => {
  const [values] = useState({
    plansDeFormation: 300,
    anneesExperience: 22,
    partenaires: 120,
    clients: 74,
    etudesMan: 35,
  });

  return (
    <div className="relative h-screen w-full text-center text-green-700">
      {/* Image de fond couvrant toute la page */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm z-[-1]"
        style={{ backgroundImage: `url('${image}')` }}
      ></div>

      {/* Contenu */}
      <div className="relative top-20 z-10 py-12 px-6">
        <h1 className="text-5xl my-20 font-bold text-[#82b89a]  mb-8">
          Bienvenue à Sac-consulting
        </h1>

        <p className="font-bold text-xl text-gray-800 mb-12 mx-auto max-w-3xl">
          Trouvez des services sur mesures à votre entreprise dans les secteurs de la formation, la certification et la mise à niveau.
          Notre mission est le développement durable des performances de l’entreprise pour renforcer sa compétitivité, favoriser sa croissance et améliorer sa rentabilité.
        </p>

        <div className="grid grid-cols-5 gap-6 mt-8">
  {[
    { title: "Plans de Formation", value: values.plansDeFormation },
    { title: "Années d'expérience", value: values.anneesExperience },
    { title: "Partenaires", value: values.partenaires },
    { title: "Clients", value: values.clients },
    { title: "Etudes Man", value: values.etudesMan },
  ].map((item) => (
    <div
      key={item.title}
      className="bg-[#82b89a] p-6 shadow-md rounded-xl w-48 h-32 mx-auto flex flex-col items-center justify-center hover:bg-[#6f9d7d] transition"
    >
      <h2 className="text-xl font-semibold text-white">{item.title}</h2>
      <p className="text-white text-3xl font-bold">
        <CountUp start={0} end={item.value} duration={3} />
      </p>
    </div>
  ))}
</div>

         
      </div>
    </div>
  );
};

export default Presentation;
