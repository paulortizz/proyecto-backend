const footballApi = require('../utils/footballApi');

// Obtener estadísticas de un partido específico
exports.getMatchStatistics = async (req, res) => {
    const { matchId } = req.params; // Obtener el ID del partido desde los parámetros de la URL

    try {
        // Solicitud a la API de football-data para estadísticas de un partido
        const response = await footballApi.get(`/fixtures/statistics`, { params: { fixture: matchId } });

        if (!response.data || response.data.response.length === 0) {
            return res.status(404).json({ message: 'No se encontraron estadísticas para el partido especificado' });
        }

        // Extraer y filtrar las estadísticas esenciales
        const statisticsData = response.data.response.map(teamStats => ({
            team: teamStats.team.name,
            logo: teamStats.team.logo,
            statistics: {
                possession: teamStats.statistics.find(stat => stat.type === "Ball Possession")?.value || "0%",
                shotsOnGoal: teamStats.statistics.find(stat => stat.type === "Shots on Goal")?.value || 0,
                shotsOffGoal: teamStats.statistics.find(stat => stat.type === "Shots off Goal")?.value || 0,
                totalShots: teamStats.statistics.find(stat => stat.type === "Total Shots")?.value || 0,
                blockedShots: teamStats.statistics.find(stat => stat.type === "Blocked Shots")?.value || 0,
                corners: teamStats.statistics.find(stat => stat.type === "Corner Kicks")?.value || 0,
                offsides: teamStats.statistics.find(stat => stat.type === "Offsides")?.value || 0,
                fouls: teamStats.statistics.find(stat => stat.type === "Fouls")?.value || 0,
                yellowCards: teamStats.statistics.find(stat => stat.type === "Yellow Cards")?.value || 0,
                redCards: teamStats.statistics.find(stat => stat.type === "Red Cards")?.value || 0,
                goalKicks: teamStats.statistics.find(stat => stat.type === "Goalkeeper Saves")?.value || 0
            }
        }));

        res.status(200).json({ status: 'success', data: statisticsData });
    } catch (error) {
        console.error('Error al obtener estadísticas del partido:', error.message || error);

        if (error.response) {
            return res.status(error.response.status).json({
                message: `Error en la API externa: ${error.response.data.message || 'Solicitud inválida'}`,
            });
        } else if (error.request) {
            return res.status(503).json({ message: 'No se pudo conectar con la API de Football. Inténtalo más tarde.' });
        } else {
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
    }
};
