const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

// FACEIT API Key
const API_KEY = process.env.FACEIT_API_KEY;
const allowedMaps = ["Mirage", "Dust2", "Nuke", "Ancient", "Inferno", "Anubis", "Train", "Vertigo"];

// Oyuncu istatistiklerini çeken endpoint
router.get('/player-stats', async (req, res) => {
    const playerId = '7ba03ba1-1138-450c-a35b-b137d9106efb';
    const gameId = 'cs2';
    const url = `https://open.faceit.com/data/v4/players/${playerId}/games/${gameId}/stats`;

    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                Accept: 'application/json',
            },
        });

        res.status(200).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            message: 'Error fetching player stats',
            error: error.response?.data || error.message,
        });
    }
});

router.get('/player/stats/:playerId', async (req, res) => {
    const { playerId } = req.params; // playerId parametresini alıyoruz
    try {
        const response = await axios.get(
            `https://open.faceit.com/data/v4/players/${playerId}/games/cs2/stats`, // gameId sabit olarak cs2
            {
                headers: { Authorization: `Bearer ${process.env.FACEIT_API_KEY}` },
            }
        );
        res.status(200).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

router.get('/match/:matchId', async (req, res) => {
    const { matchId } = req.params;
    try {
        const response = await axios.get(
            `https://open.faceit.com/data/v4/matches/${matchId}`,
            {
                headers: { Authorization: `Bearer ${API_KEY}` },
            }
        );

        const teams = response.data.teams;

        const team1Data = await fetchPlayerMapData(teams.faction1 ,"team1");
        const team2Data = await fetchPlayerMapData(teams.faction2, "team2");

        res.status(200).json({ team1: team1Data, team2: team2Data }); // Her iki takımı ayrı ayrı döndürüyoruz
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

async function fetchPlayerMapData(faction, teamName) {
    const teamData = {};


    // Takım içindeki her oyuncu için işlem yapacağız
    for (const player of faction.roster) {
        const playerId = player.player_id;
    
        if (!teamData[player.nickname]) {
            teamData[player.nickname] = {};
        }
    
        if (!teamData[player.nickname]["stats"]) {
            teamData[player.nickname]["stats"] = {};
        }
    
        teamData[player.nickname]["avatar"] = player.avatar;
        teamData[player.nickname]["nickname"] = player.nickname;
        teamData[player.nickname]["membership"] = player.membership;
        teamData[player.nickname]["game_skill_level"] = player.game_skill_level;
        teamData[player.nickname]["player_id"] = player.player_id;
    
        try {
            // Oyuncu istatistiklerini çekiyoruz
            const response = await axios.get(
                `https://open.faceit.com/data/v4/players/${playerId}/stats/cs2`,
                {
                    headers: { Authorization: `Bearer ${API_KEY}` },
                }
            );
            const playerStats = response.data;
            console.log(teamName)
            const lifetimeStats = playerStats[teamName]
            return lifetimeStats
            
            teamData[player.nickname]["lifetime"] = lifetimeStats.lifetime;

            // Her harita verisini işliyoruz
            playerStats.segments.forEach(segment => {
                if (segment.mode == "5v5") {
                    if (segment.label && segment.label !== '' && allowedMaps.includes(segment.label)) {
                        const mapName = segment.label;
    
                        // Eğer mapName altında stats yoksa, başlatıyoruz
                        if (!teamData[player.nickname]["stats"][mapName]) {
                            teamData[player.nickname]["stats"][mapName] = {};
                        }
    
                        // Winrate'i ekliyoruz
                        teamData[player.nickname]["stats"][mapName]["winrate"] = segment.stats["Win Rate %"]
                            ? `${segment.stats["Win Rate %"]}`
                            : "0";
                    }
                }
            });
            
        } catch (error) {
            console.error(`Error fetching stats for player ${player.player_id}:`, error.message);
        }
    }
    

    return teamData;
}

module.exports = router;
