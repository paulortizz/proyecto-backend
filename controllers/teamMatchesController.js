const footballApi = require('../utils/footballApi');

// Obtener todos los partidos de un equipo categorizados por ligas
exports.getTeamMatches2 = async (req, res) => {
    const { teamId } = req.params;

    if (!teamId) {
        return res.status(400).json({ status: 'error', message: 'Team ID is required' });
    }

    try {
        const season = 2024; // Temporada actual

        // Obtener todos los partidos del equipo en la temporada actual
        const response = await footballApi.get(`/fixtures?team=${teamId}&season=${season}`);
        const matches = response.data.response;

        if (!matches || matches.length === 0) {
            return res.status(404).json({ status: 'error', message: 'No matches found for this team' });
        }

        // Organizar partidos por liga
        const matchesByLeague = {};

        matches.forEach((match) => {
            const leagueId = match.league.id;
            const leagueName = match.league.name;
            const leagueLogo = match.league.logo;

            if (!matchesByLeague[leagueId]) {
                matchesByLeague[leagueId] = {
                    leagueName: leagueName,
                    leagueLogo: leagueLogo,
                    matches: [],
                };
            }

            matchesByLeague[leagueId].matches.push({
                fixtureId: match.fixture.id,
                date: match.fixture.date,
                homeTeam: {
                    id: match.teams.home.id,
                    name: match.teams.home.name,
                    logo: match.teams.home.logo,
                },
                awayTeam: {
                    id: match.teams.away.id,
                    name: match.teams.away.name,
                    logo: match.teams.away.logo,
                },
                goals: match.goals,
                status: match.fixture.status,
            });
        });

        // Convertir el objeto en un array para facilitar el manejo en el frontend
        const result = Object.values(matchesByLeague);

        res.status(200).json({ status: 'success', data: result });
    } catch (error) {
        console.error('Error fetching team matches:', error.message);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
