const AvisUserService = require('../../services/User/avisUserService');

class AvisUserController {
    constructor() {
        this.service = new AvisUserService();
    }

    async createAvis(req, res) {
        try {
            const avisData = req.body;
            const nouvelAvis = await this.service.createAvis(avisData);

            res.status(201).json({
                success: true,
                message: 'Évaluation enregistrée avec succès',
                data: nouvelAvis
            });

        } catch (error) {
            console.error('Controller Error - createAvis:', error);
            
            if (error.message.includes('obligatoires')) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la création de l\'avis'
                });
            }
        }
    }

    async getSessions(req, res) {
        try {
            const { id_participant } = req.query;
            const sessions = await this.service.getSessionsByParticipant(id_participant);

            res.json({
                success: true,
                sessions
            });

        } catch (error) {
            console.error('Controller Error - getSessions:', error);
            
            if (error.message.includes('requis')) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la récupération des sessions'
                });
            }
        }
    }
}

module.exports = AvisUserController;