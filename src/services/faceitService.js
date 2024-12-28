const axios = require('axios');

const fetchPlayerStats = async (playerId, gameId, { offset, limit, from, to }) => {
    const url = `https://open.faceit.com/data/v3/players/${playerId}/games/${gameId}/stats`;
    const headers = {
        Authorization: `Bearer ${process.env.FACEIT_API_KEY}`,
        Accept: 'application/json',
    };

    const params = { offset, limit, from, to };
    const { data } = await axios.get(url, { headers, params });
    return data;
};

module.exports = { fetchPlayerStats };
