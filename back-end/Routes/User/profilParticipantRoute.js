const express = require("express");
const router = express.Router();
const {getParticipantProfile, updateParticipantProfile} = require("../../Controllers/User/profilParticipantUserController");

router.get("/:id", getParticipantProfile);
router.put("/:id",updateParticipantProfile);
module.exports = router;
