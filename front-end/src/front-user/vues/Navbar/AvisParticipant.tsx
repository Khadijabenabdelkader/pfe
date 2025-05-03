import React, { useState, useEffect } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import * as docx from "docx";

type Session = {
  id_session: number;
  theme: string;
  code: string;
  etat: string;
};

type EvaluationCriteria = {
  label: string;
  name: keyof typeof defaultFormData;
};

const defaultFormData = {
  note: "",
  commentaire: "",
  adaptation_programme_vie_pro: 0,
  moyens_pedagogiques_utilises: 0,
  convenance_horaires_formation: 0,
  apports_niveau_professionnel: 0,
  qualite_documentation_distribuee: 0,
  maitrise_globale_sujets_presentes: 0,
  traitement_exemples_travail: 0,
  animations_seances: 0,
  homogeneite_groupe: 0,
  satisfaction_attentes: 0,
  duree_formation: ""
};

const evaluationCriteria: EvaluationCriteria[] = [
  { label: "Adaptation du programme à votre vie professionnelle", name: "adaptation_programme_vie_pro" },
  { label: "Moyens pédagogiques utilisés", name: "moyens_pedagogiques_utilises" },
  { label: "Convenance des horaires de formation", name: "convenance_horaires_formation" },
  { label: "Apports au niveau professionnel", name: "apports_niveau_professionnel" },
  { label: "Qualité de la documentation distribuée", name: "qualite_documentation_distribuee" },
  { label: "Maîtrise globale des sujets présentés", name: "maitrise_globale_sujets_presentes" },
  { label: "Traitement des exemples de travail", name: "traitement_exemples_travail" },
  { label: "Animations des séances", name: "animations_seances" },
  { label: "Homogénéité du groupe", name: "homogeneite_groupe" },
  { label: "Satisfaction de vos attentes", name: "satisfaction_attentes" }
];

const satisfactionLevels = [
  { value: 1, label: "Insuffisant" },
  { value: 2, label: "Peu satisfaisant" },
  { value: 3, label: "Satisfaisant" },
  { value: 4, label: "Très satisfaisant" }
];

const durationOptions = [
  { value: "", label: "Sélectionner" },
  { value: "Longue", label: "Longue" },
  { value: "Courte", label: "Courte" },
  { value: "Convenable", label: "Convenable" }
];

const AvisParticipant = () => {
  const [idParticipant, setIdParticipant] = useState<number | null>(null);
  const [idSession, setIdSession] = useState<string>("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [formData, setFormData] = useState(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      const userData = JSON.parse(storedUserData);
      setIdParticipant(userData.id_participant);
    }
  }, []);

  useEffect(() => {
    if (idParticipant) {
      fetchSessions();
    }
  }, [idParticipant]);

  const fetchSessions = async () => {
    try {
      const url = `${import.meta.env.VITE_APP_API_URL}/apiUser/sessions?id_participant=${idParticipant}`;
      const response = await axios.get(url);
      
      if (Array.isArray(response.data?.sessions)) {
        setSessions(response.data.sessions);
      } else {
        console.error("Format de données inattendu pour les sessions");
        setSessions([]);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des sessions :", error);
      setSessions([]);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!idSession) {
      newErrors.idSession = "Veuillez sélectionner une session";
    }
    
    if (!formData.note || Number(formData.note) < 1 || Number(formData.note) > 10) {
      newErrors.note = "Veuillez donner une note entre 1 et 10";
    }
    
    if (!formData.duree_formation) {
      newErrors.duree_formation = "Veuillez sélectionner une durée";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === "radio" ? Number(value) : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  const generateWordDocument = async () => {
    const { Document, Paragraph, TextRun, HeadingLevel, Packer } = await import("docx");
    
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: "Fiche d'évaluation de formation",
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: `Session évaluée: ${
                sessions.find(s => s.id_session === Number(idSession))?.theme || ""
              } (${sessions.find(s => s.id_session === Number(idSession))?.code || ""})`,
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: `Note globale: ${formData.note}/10`,
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "Commentaire:",
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 50 },
            }),
            new Paragraph({
              children: [new TextRun(formData.commentaire || "Aucun commentaire")],
              spacing: { after: 150 },
            }),
            new Paragraph({
              text: "Évaluation des aspects pédagogiques:",
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 50 },
            }),
            ...evaluationCriteria.map(criterion => 
              new Paragraph({
                text: `${criterion.label}: ${
                  satisfactionLevels.find(l => l.value === formData[criterion.name])?.label || "Non évalué"
                }`,
                spacing: { after: 50 },
              })
            ),
            new Paragraph({
              text: `Durée de la formation: ${formData.duree_formation}`,
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: `Date d'évaluation: ${new Date().toLocaleDateString()}`,
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `evaluation-formation-${new Date().toISOString().split('T')[0]}.docx`);
  }; 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/apiUser/avisParticipant`,
        {
          id_participant: idParticipant,
          id_session: idSession,
          ...formData
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      
      await generateWordDocument();

      setSubmitSuccess(true);
      setFormData(defaultFormData);
      setIdSession("");
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error("Erreur lors de l'envoi :", error);
      alert("Une erreur est survenue lors de l'envoi de votre évaluation");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg text-center">
        <div className="text-green-500 text-2xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-teal-600 mb-2">Merci pour votre évaluation !</h2>
        <p className="text-gray-600">Votre feedback a été enregistré avec succès.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-teal-600 mb-6 text-center">Fiche d'évaluation</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Session Selection */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Session évaluée *</label>
          <select
            className={`w-full p-3 border rounded-lg focus:ring focus:ring-teal-300 ${
              errors.idSession ? "border-red-500" : "border-gray-300"
            }`}
            value={idSession}
            onChange={(e) => {
              setIdSession(e.target.value);
              if (errors.idSession) {
                setErrors(prev => ({ ...prev, idSession: "" }));
              }
            }}
            required
          >
            <option value="">-- Choisir une session --</option>
            {sessions.map((session) => (
              <option key={session.id_session} value={session.id_session}>
                {session.theme} ({session.code}) - {session.etat}
              </option>
            ))}
          </select>
          {errors.idSession && (
            <p className="text-red-500 text-sm mt-1">{errors.idSession}</p>
          )}
        </div>

        {/* Global Rating */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Note globale (sur 10) *</label>
          <input
            type="number"
            name="note"
            value={formData.note}
            onChange={handleChange}
            min="1"
            max="10"
            required
            className={`w-full border rounded-lg p-3 focus:ring focus:ring-teal-300 ${
              errors.note ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.note && (
            <p className="text-red-500 text-sm mt-1">{errors.note}</p>
          )}
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Commentaire</label>
          <textarea
            name="commentaire"
            value={formData.commentaire}
            onChange={handleChange}
            rows={4}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring focus:ring-teal-300"
            placeholder="Vos remarques, suggestions..."
          ></textarea>
        </div>

        {/* Evaluation Criteria */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-teal-600 mb-4">Évaluation des aspects pédagogiques</h3>
          <div className="space-y-6">
            {evaluationCriteria.map((criterion) => (
              <div key={criterion.name} className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-gray-700 font-medium mb-3">{criterion.label}</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {satisfactionLevels.map((level) => (
                    <label key={level.value} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={criterion.name}
                        value={level.value}
                        checked={formData[criterion.name] === level.value}
                        onChange={handleChange}
                        className="h-5 w-5 text-teal-600 focus:ring-teal-500"
                      />
                      <span>{level.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Durée de la formation *</label>
          <select
            name="duree_formation"
            value={formData.duree_formation}
            onChange={handleChange}
            className={`w-full border rounded-lg p-3 focus:ring focus:ring-teal-300 ${
              errors.duree_formation ? "border-red-500" : "border-gray-300"
            }`}
          >
            {durationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.duree_formation && (
            <p className="text-red-500 text-sm mt-1">{errors.duree_formation}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white ${
            isSubmitting ? "bg-teal-400" : "bg-teal-600 hover:bg-teal-700"
          } transition duration-300 flex items-center justify-center`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Envoi en cours...
            </>
          ) : (
            "Soumettre l'évaluation"
          )}
        </button>
      </form>
    </div>
  );
};

export default AvisParticipant;