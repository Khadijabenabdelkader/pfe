const express = require("express");
const router = express.Router();

const {
 getCatalogue,updateDomain,getFormateursBySession,addThemeToDomain } = require("../../Controllers/Admin/catalogueAdminController");

router.get('/',getCatalogue)
router.get('/:id_session', getFormateursBySession);
router.put('/updateDomain/:id',updateDomain)
router.post('/addThemesToDomain', addThemeToDomain);
module.exports = router;
