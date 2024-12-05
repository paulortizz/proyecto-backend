const footballApi = require('../utils/footballApi');

// Controlador para obtener la tabla de posiciones de una liga en una temporada
exports.getStandings2 = async (req, res) => {
    const { leagueId, season } = req.params;

    if (!leagueId || !season) {
        return res.status(400).json({
            status: 'error',
            message: 'League ID and season are required',
        });
    }

    try {
        const response = await footballApi.get(`/standings?league=${leagueId}&season=${season}`);
        
        // Verifica si el response tiene el formato esperado
        const standings = response?.data?.response?.[0]?.league?.standings;

        if (!standings || standings.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'No standings found for this league and season',
            });
        }

        // Transformar y devolver los datos de la tabla de posiciones
        const transformedStandings = standings[0].map(team => ({
            position: team.rank,
            teamName: team.team.name,
            teamLogo: team.team.logo,
            played: team.all.played,
            wins: team.all.win,
            draws: team.all.draw,
            losses: team.all.lose,
            goalsFor: team.all.goals.for,
            goalsAgainst: team.all.goals.against,
            goalDifference: team.goalsDiff,
            points: team.points,
        }));

        res.status(200).json({
            status: 'success',
            data: transformedStandings,
        });
    } catch (error) {
        console.error('Error fetching standings:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
