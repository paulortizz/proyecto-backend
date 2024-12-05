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

        // Obtener leagueId del primer próximo partido, si está disponible
        const leagueId = nextMatch?.league?.id || null;

        res.status(200).json({
            status: 'success',
            data: {
                team: {
                    id: team.id,
                    name: team.name,
                    logo: team.logo,
                    country: team.country,
                    leagueId: leagueId, // Aseguramos leagueId desde nextMatch
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


// Obtener todos los partidos jugados por un equipo, organizados por liga
exports.getAllMatchesByTeam = async (req, res) => {
    const { teamId } = req.params;

    if (!teamId) {
        return res.status(400).json({ status: 'error', message: 'Team ID is required' });
    }

    try {
        const season = new Date().getFullYear();
        const response = await footballApi.get(`/fixtures?team=${teamId}&season=${season}`);
        const matches = response.data.response;

        if (!matches || matches.length === 0) {
            return res.status(404).json({ status: 'error', message: 'No matches found for this team' });
        }

        const matchesByCompetition = matches.reduce((acc, match) => {
            const leagueId = match.league.id;
            if (!acc[leagueId]) {
                acc[leagueId] = {
                    leagueName: match.league.name,
                    leagueLogo: match.league.logo,
                    matches: [],
                };
            }
            acc[leagueId].matches.push({
                fixtureId: match.fixture.id,
                date: match.fixture.date,
                venue: match.fixture.venue,
                homeTeam: match.teams.home,
                awayTeam: match.teams.away,
                goals: match.goals,
                status: match.fixture.status,
            });
            return acc;
        }, {});

        res.status(200).json({
            status: 'success',
            data: Object.values(matchesByCompetition).sort((a, b) =>
                a.leagueName.localeCompare(b.leagueName)
            ),
        });
    } catch (error) {
        console.error('Error fetching matches:', error.message);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

// Obtener partidos de un equipo filtrados por liga
exports.getMatchesByLeague = async (req, res) => {
    const { teamId, leagueId } = req.params;

    if (!teamId || !leagueId) {
        return res.status(400).json({
            status: 'error',
            message: 'Team ID and League ID are required',
        });
    }

    try {
        const season = new Date().getFullYear();
        const response = await footballApi.get(`/fixtures?team=${teamId}&league=${leagueId}&season=${season}`);
        const matches = response.data.response;

        if (!matches || matches.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'No matches found for this team in the specified league',
            });
        }

        const formattedMatches = matches.map((match) => ({
            fixtureId: match.fixture.id,
            date: match.fixture.date,
            venue: match.fixture.venue,
            homeTeam: match.teams.home,
            awayTeam: match.teams.away,
            goals: match.goals,
            status: match.fixture.status,
        }));

        res.status(200).json({ status: 'success', data: formattedMatches });
    } catch (error) {
        console.error('Error fetching matches by league:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
