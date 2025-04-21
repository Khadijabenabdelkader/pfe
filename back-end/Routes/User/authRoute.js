const express = require("express");
const router = express.Router();
const { login, register, requestPasswordReset ,resetPassword,verifyToken,changePassword} = require("../../Controllers/User/authUserController");



// Définition des routes d'authentification
router.post("/login", login);
router.post("/register", register);
router.post('/request-password-reset',requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/change-password', verifyToken, changePassword);

module.exports = router; // ⚠️ S'assurer que le module est bien exporté
