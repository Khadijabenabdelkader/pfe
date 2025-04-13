import React, { useState } from "react";
import axios from "axios";

const Test: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [idFormateur, setIdFormateur] = useState<string>("1"); // ID Formateur fixe pour l'exemple
  const [message, setMessage] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Sélectionnez un fichier !");
      return;
    }

    const formData = new FormData();
    formData.append("fiche", file);
    formData.append("id_formateur", idFormateur);

    try {
      const response = await axios.post("http://localhost:5001/api/fiches/upload", formData);
      setMessage(response.data.message);
    } catch (error) {
      setMessage("Erreur lors de l'upload");
    }
  };

  return (
    <div className="pt-20 p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Uploader une Fiche Programme</h2>
      <input type="file" accept=".pdf" onChange={handleFileChange} className="mb-2" />
      <button onClick={handleUpload} className="px-4 py-2 bg-blue-500 text-white rounded">
        Envoyer
      </button>
      {message && <p className="mt-2 text-red-500">{message}</p>}
    </div>
  );
};

export default Test;
