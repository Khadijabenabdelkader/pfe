/*const express = require('express');
const router = express.Router();
const avisFormateurC = require('../../Controllers/User/AvisFormateurController');
router.post('/avisFormateur',avisFormateurC.AvisFormateur);
module.exports = router;*/
const express = require('express');
const router = express.Router();
const avisFormateurC = require('../../Controllers/User/AvisFormateurController');
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifier que l'utilisateur est un formateur
    if (decoded.role !== 'formateur') {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentification échouée' });
  }
};

router.get('/themes', avisFormateurC.getThemesByFormateur);

router.get('/feuille-presence/:id_presence', avisFormateurC.getFeuillePresence);

router.get('/participants', avisFormateurC.getParticipantsByPresence);

router.post('/evaluation', avisFormateurC.submitEvaluation);


module.exports = router;