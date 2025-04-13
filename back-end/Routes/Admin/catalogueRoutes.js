const express = require("express");
const router = express.Router();

const {
 getCatalogue,updateDomain,getFormateursBySession
  
} = require("../../Controllers/Admin/catalogueAdminController");

router.get('/',getCatalogue)
router.get('/:id_session',getFormateursBySession);
router.put('/updateDomain/:id',updateDomain)
module.exports = router;
