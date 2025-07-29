import React, { useState } from "react";
import axios from "axios";
import { mailOutline, callOutline, chatbubbleOutline } from "ionicons/icons";
import { IonIcon } from "@ionic/react";

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({ nom: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post("http://localhost:5000/apiUser/contact", formData);
      alert("Message envoyé avec succès !");
      setFormData({ nom: "", email: "", message: "" });
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* LEFT SIDE - INFO */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              Contactez notre équipe
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Votre avis compte énormément pour nous. N'hésitez pas à nous faire part 
              de vos questions, suggestions ou remarques. Notre équipe s'engage à vous 
              répondre dans les plus brefs délais.
            </p>
          </div>
          
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="mt-1 text-teal-500">
                <IonIcon icon={mailOutline} className="text-2xl" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Email</h3>
                <a 
                  href="mailto:direction@sac-consulting.com" 
                  className="text-gray-600 hover:text-teal-500 transition-colors"
                >
                  direction@sac-consulting.com
                </a>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="mt-1 text-teal-500">
                <IonIcon icon={callOutline} className="text-2xl" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Téléphone</h3>
                <a 
                  href="tel:+21652994404" 
                  className="text-gray-600 hover:text-teal-500 transition-colors"
                >
                  +216 52 994 404
                </a>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="mt-1 text-teal-500">
                <IonIcon icon={chatbubbleOutline} className="text-2xl" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Chat en direct</h3>
                <p className="text-gray-600">Disponible prochainement</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - FORM */}
        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-xl p-8 border border-gray-100">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                placeholder="Votre nom complet"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adresse e-mail</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Votre adresse e-mail"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                required
                placeholder="Écrivez votre message ici..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-colors ${
                isSubmitting ? 'bg-teal-400' : 'bg-teal-500 hover:bg-teal-600'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Envoi en cours...
                </span>
              ) : (
                "Envoyer le message"
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ContactForm;