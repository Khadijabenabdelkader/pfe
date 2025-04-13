const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../connect");

const router = express.Router();

// Configuration de Multer pour stocker les fichiers PDF dans 'uploads/'
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nom unique
  },
});

const upload = multer({ storage });

// 📌 Route pour uploader une fiche programme
router.post("/upload", upload.single("fiche"), (req, res) => {
  const { id_formateur } = req.body;
  if (!id_formateur || !req.file) {
    return res.status(400).json({ error: "Données manquantes" });
  }

  const filePath = req.file.filename; // On stocke seulement le nom du fichier

  const sql = "INSERT INTO fiche_prg (chemin, id_formateur) VALUES (?, ?)";
  db.query(sql, [filePath, id_formateur], (err, result) => {
    if (err) {
      console.error("Erreur lors de l'insertion :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    res.json({ message: "Fiche enregistrée !", id_fichePrg: result.insertId });
  });
});

// 📌 Route pour récupérer toutes les fiches programme
router.get("/", (req, res) => {
  const sql = "SELECT * FROM fiche_prg";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    res.json(results);
  });
});

module.exports = router;
