const footballApi = require('../utils/footballApi');

exports.getPlayerStats = async (req, res) => {
    const { leagueId, season, teamId } = req.query;

    if (!leagueId || !season || !teamId) {
        return res.status(400).json({ status: 'error', message: 'League ID, season, and team ID are required' });
    }

    try {
        // Obtener todos los partidos finalizados de la liga y temporada
        const matchesResponse = await footballApi.get(`/fixtures?league=${leagueId}&season=${season}&status=FT`);
        const matches = matchesResponse.data.response;

        if (!matches || matches.length === 0) {
            return res.status(404).json({ status: 'error', message: 'No matches found for the given league and season.' });
        }

        // Consolidar estadísticas por jugador
        const playerStats = {};

        for (const match of matches) {
            const fixtureId = match.fixture.id;

            // Obtener estadísticas de jugadores para cada partido
            const statsResponse = await footballApi.get(`/fixtures/players?fixture=${fixtureId}`);
            const playersData = statsResponse.data.response;

            if (!playersData || playersData.length === 0) continue;

            // Filtrar estadísticas por teamId
            const teamStats = playersData.find(team => team.team.id === parseInt(teamId, 10));
            if (!teamStats) continue; // Si no hay estadísticas para este equipo, omitir

            for (const player of teamStats.players) {
                const playerId = player.player.id;
                const stats = player.statistics[0] || {};

                if (!playerStats[playerId]) {
                    playerStats[playerId] = {
                        playerId: player.player.id,
                        playerName: player.player.name,
                        teamName: teamStats.team.name,
                        goals: 0,
                        assists: 0,
                        shotsOnTarget: 0,
                        matchesPlayed: 0,
                        yellowCards: 0,
                        redCards: 0,
                    };
                }

                // Sumar las estadísticas del jugador
                playerStats[playerId].goals += stats.goals?.total || 0;
                playerStats[playerId].assists += stats.goals?.assists || 0;
                playerStats[playerId].shotsOnTarget += stats.shots?.on || 0;
                playerStats[playerId].matchesPlayed += 1; // Contar el partido
                playerStats[playerId].yellowCards += stats.cards?.yellow || 0;
                playerStats[playerId].redCards += stats.cards?.red || 0;
            }
        }

        // Convertir el objeto de estadísticas en un array y ordenarlo por goles
        const formattedStats = Object.values(playerStats).sort((a, b) => b.goals - a.goals);

        res.status(200).json({ status: 'success', data: formattedStats });
    } catch (error) {
        console.error('Error fetching player stats:', error.response?.data || error.message);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
