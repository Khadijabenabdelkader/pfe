const Formateur = require('../../models/admin/formateur');
const formateurRepository = require('../../repositories/admin/formateur');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

exports.getAllFormateurs = async () => {
  try {
    const formateurs = await formateurRepository.findAllFormateurs();
    // Tri par id décroissant comme dans le frontend
    return formateurs.sort((a, b) => b.id_formateur - a.id_formateur);
  } catch (error) {
    console.error('Error in getAllFormateurs service:', error);
    throw error;
  }
};

exports.extractPdfContent = async (formateurId, searchTerm) => {
  try {
    const pdfPaths = await formateurRepository.getFormateurPdfPaths(formateurId);
    
    let combinedText = "";
    for (const filePath of pdfPaths) {
      try {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        combinedText += pdfData.text + " ";
      } catch (err) {
        console.error(`Error processing PDF: ${filePath}`, err);
      }
    }

    return {
      content: combinedText.toLowerCase().includes(searchTerm.toLowerCase()) 
        ? combinedText 
        : ""
    };
  } catch (error) {
    console.error('Error in extractPdfContent service:', error);
    throw error;
  }
};

exports.deleteFormateur = async (id) => {
  try {
    // Suppression des fichiers associés
    const files = await formateurRepository.getFormateurFiles(id);
    if (files.cv) {
      const cvPath = path.join(__dirname, '../../../uploads', files.cv);
      fs.unlinkSync(cvPath);
    }
    
    // Suppression en base
    await formateurRepository.deleteFormateur(id);
  } catch (error) {
    console.error('Error in deleteFormateur service:', error);
    throw error;
  }
}