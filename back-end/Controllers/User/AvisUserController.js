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
            
            if (!id_participant) {
                return res.status(400).json({
                    success: false,
                    message: 'ID participant requis'
                });
            }

            const sessions = await this.service.getSessionsByParticipant(id_participant);

            // Formater la réponse pour éviter les problèmes de sérialisation
            const response = {
                success: true,
                sessions: JSON.parse(JSON.stringify(sessions))
            };

            res.json(response);

        } catch (error) {
            console.error('Controller Error - getSessions:', error);
            
            const status = error.message.includes('requis') ? 400 : 500;
            const message = status === 400 ? error.message : 'Erreur lors de la récupération des sessions';
            
            res.status(status).json({
                success: false,
                message
            });
        }
    }
}

module.exports = AvisUserController;