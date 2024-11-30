const footballApi = require('../utils/footballApi');

// Obtener detalles de un equipo (logo, nombre, próximo partido, últimos partidos)
exports.getTeamOverview = async (req, res) => {
    const { teamId } = req.params;

    if (!teamId) {
        return res.status(400).json({ status: 'error', message: 'Team ID is required' });
    }

    try {
        // Obtener información básica del equipo
        const teamResponse = await footballApi.get(`/teams?id=${teamId}`);
        const team = teamResponse.data.response[0]?.team;

        if (!team) {
            return res.status(404).json({ status: 'error', message: 'Team not found' });
        }

        // Obtener el próximo partido del equipo
        const nextMatchResponse = await footballApi.get(`/fixtures?team=${teamId}&next=1`);
        const nextMatch = nextMatchResponse.data.response[0] || null;

        // Obtener los últimos 3 partidos jugados por el equipo
        const recentMatchesResponse = await footballApi.get(`/fixtures?team=${teamId}&last=3`);
        const recentMatches = recentMatchesResponse.data.response || [];

        // Respuesta consolidada
        res.status(200).json({
            status: 'success',
            data: {
                team: {
                    id: team.id,
                    name: team.name,
                    logo: team.logo,
                    country: team.country,
                },
                nextMatch: nextMatch,
                recentMatches: recentMatches,
            },
        });
    } catch (error) {
        console.error('Error fetching team overview:', error.message);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
