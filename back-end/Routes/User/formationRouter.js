const express = require('express');
const router = express.Router();
const multer = require("multer");

const upload = multer({ dest: 'uploads/' });


const {getDomains, getFormation,getSession, getfichePrg,  sendMail} = require('../../Controllers/User/formationUserController');
router.get('/Domains', getDomains);
router.get('/Form', getFormation);
router.get('/sessions', getSession);
router.post('/send-email', sendMail);
router.get('/fiche/:id_fichePrg', getfichePrg);
module.exports = router;