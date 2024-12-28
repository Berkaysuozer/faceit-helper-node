const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.FACEIT_API_KEY;
const FACEIT_API_URL = 'https://open.faceit.com/data/v4';

const allowedMaps = ["Mirage", "Dust2", "Nuke", "Ancient", "Inferno", "Anubis", "Train", "Vertigo"];

class FaceitService {
    constructor() {
        this.axiosInstance = axios.create({
            baseURL: FACEIT_API_URL,
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Accept': 'application/json'
            }
        });
    }

    async getPlayerStats(playerId) {
        try {
            const response = await this.axiosInstance.get(`/players/${playerId}/games/cs2/stats`);
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching player stats: ${error.message}`);
        }
    }

    async getMatchDetails(matchId) {
        try {
            const response = await this.axiosInstance.get(`/matches/${matchId}`);
            const teams = response.data.teams;
            
            const team1Data = await this.fetchTeamData(teams.faction1);
            const team2Data = await this.fetchTeamData(teams.faction2);
            
            return { team1: team1Data, team2: team2Data };
        } catch (error) {
            throw new Error(`Error fetching match details: ${error.message}`);
        }
    }

    async fetchTeamData(faction) {
        const teamData = {};

        for (const player of faction.roster) {
            try {
                const playerStats = await this.getPlayerStats(player.player_id);
                
                teamData[player.nickname] = {
                    avatar: player.avatar,
                    nickname: player.nickname,
                    membership: player.membership,
                    game_skill_level: player.game_skill_level,
                    player_id: player.player_id,
                    player_stats: playerStats,
                    lifetime: playerStats.lifetime || {},
                    stats: {}
                };

                if (playerStats && playerStats.segments) {
                    teamData[player.nickname].stats = this.processMapStats(playerStats.segments);
                }
            } catch (error) {
                console.error(`Error processing player ${player.nickname}: ${error.message}`);
                teamData[player.nickname] = {
                    avatar: player.avatar,
                    nickname: player.nickname,
                    membership: player.membership,
                    game_skill_level: player.game_skill_level,
                    player_id: player.player_id,
                    error: error.message,
                    stats: {}
                };
            }
        }

        return teamData;
    }

    processMapStats(segments) {
        const mapStats = {};

        if (Array.isArray(segments)) {
            segments.forEach(segment => {
                if (segment && segment.mode === "5v5" && segment.label && allowedMaps.includes(segment.label)) {
                    mapStats[segment.label] = {
                        winrate: segment.stats && segment.stats["Win Rate %"] ? segment.stats["Win Rate %"] : "0"
                    };
                }
            });
        }

        return mapStats;
    }
}

module.exports = new FaceitService();
