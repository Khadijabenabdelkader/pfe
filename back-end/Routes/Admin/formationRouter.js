const express = require("express");
const router = express.Router();
const {
  getFormation,
  deleteFormation,
  deleteSession,
  addFormation,
  updateFormation,
  updateSession,upload,
  addSession
} = require("../../Controllers/Admin/formationAdminController");
const{addDomain}= require("../../Controllers/Admin/addDomainAdminController");

// Routes pour les formations
//router.get("/formations", getFormation);
//router.get("/formations/:id", getFormationById);
//router.post("/formations", addFormation);
router.delete("/DEL/:id_formation", deleteFormation);
router.put("/update/:id_formation", (req, res, next) => {    next();  }, updateFormation);
router.put("/:id/sessions/:id_session",updateSession);
router.delete("/formations/:id_formation/sessions/:id_session", deleteSession);
router.post("/addFormation", upload.array("fiche_programme"), addFormation);

router.post('/addDomain',addDomain);

router.get('/Form',getFormation);
module.exports = router;