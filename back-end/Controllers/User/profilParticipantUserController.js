const ProfilParticipantUserService = require('../../services/User/profilParticipantUserService');

class ProfilParticipantUserController {
    constructor() {
        this.service = new ProfilParticipantUserService();
    }

    async getParticipantProfile(req, res) {
        try {
            const id_participant = req.params.id;
            console.log(`Tentative de récupération du participant ${id_participant}`); // Debug
            
            if (!id_participant || isNaN(id_participant)) {
                return res.status(400).json({ 
                    error: "ID participant invalide",
                    received: id_participant
                });
            }
    
            const profile = await this.service.getParticipantProfile(id_participant);
            
            if (!profile) {
                return res.status(404).json({ 
                    message: "Participant non trouvé",
                    id: id_participant
                });
            }
    
            res.status(200).json(profile);
        } catch (error) {
            console.error("Erreur détaillée dans le controller:", {
                error: error,
                params: req.params,
                stack: error.stack
            });
            
            if (error.message === 'Participant non trouvé') {
                res.status(404).json({ 
                    message: error.message,
                    id: req.params.id
                });
            } else {
                res.status(500).json({ 
                    error: "Erreur serveur",
                    details: error.message
                });
            }
        }
    }
    async updateParticipantProfile(req, res) {
            const { id_participant } = req.params;
            const updateData = req.body;
        
            try {
                // Validation basique
                if (!id_participant || isNaN(id_participant)) {
                    return res.status(400).json({
                        success: false,
                        message: 'ID participant invalide'
                    });
                }
        
                const result = await participantService.updateParticipantProfile(id_participant, updateData);
        
                res.json({
                    success: true,
                    message: result.message,
                    data: {
                        participant: result.participant,
                        entreprise: result.entreprise,
                        newEntrepriseId: result.newEntrepriseId
                    }
                });
        
            } catch (error) {
                console.error('Controller Error - updateProfile:', error);
        
                const statusCode = error.message.includes('Validation error') ? 400 : 500;
                
                res.status(statusCode).json({
                    success: false,
                    message: error.message,
                    error: process.env.NODE_ENV === 'development' ? error.stack : undefined
                });
            }
        }  
}

module.exports = ProfilParticipantUserController;