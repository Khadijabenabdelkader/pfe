const express = require('express');
const {
  getFormateurs,
  getFormateurById,
  addFormateur,
  updateFormateur,
  deleteFormateur,
} = require('../../Controllers/User/formateursUserController');

const router = express.Router();

router.get('/', getFormateurs);
router.get('/:id', getFormateurById);
router.post('/', addFormateur);
router.put('/:id', updateFormateur);
router.delete('/:id', deleteFormateur);

module.exports = router;
