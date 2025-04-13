const express = require("express");
const router = express.Router();
const { login, register } = require("../../Controllers/User/authUserController");



// Définition des routes d'authentification
router.post("/login", login);
router.post("/register", register);

module.exports = router; // ⚠️ S'assurer que le module est bien exporté
