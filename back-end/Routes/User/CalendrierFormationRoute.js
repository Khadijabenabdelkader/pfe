const express = require('express');
const router = express.Router();

const{getCalendrier, getDetailCalendrier} = require('../../Controllers/User/CalendrierFormationController');
router.get("/",getCalendrier);
router.get("/:id",getDetailCalendrier);
module.exports = router;