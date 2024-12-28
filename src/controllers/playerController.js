const { fetchPlayerStats } = require('../services/faceitService');

const getPlayerStats = async (req, res) => {
    const { playerId, gameId } = req.params;
    const { offset = 0, limit = 20, from, to } = req.query;

    try {
        const data = await fetchPlayerStats(playerId, gameId, { offset, limit, from, to });
        res.json(data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};

module.exports = { getPlayerStats };
