const faceitService = require('../services/faceitService');

class FaceitController {
    async getPlayerStats(req, res) {
        const { playerId } = req.params;
        
        try {
            const stats = await faceitService.getPlayerStats(playerId);
            res.json(stats);
        } catch (error) {
            console.error(`Error in getPlayerStats: ${error.message}`);
            res.status(500).json({ 
                error: 'Failed to fetch player stats',
                details: error.message 
            });
        }
    }

    async getMatchDetails(req, res) {
        const { matchId } = req.params;
        
        try {
            const matchData = await faceitService.getMatchDetails(matchId);
            res.json(matchData);
        } catch (error) {
            console.error(`Error in getMatchDetails: ${error.message}`);
            res.status(500).json({ 
                error: 'Failed to fetch match details',
                details: error.message 
            });
        }
    }
}

module.exports = new FaceitController(); 