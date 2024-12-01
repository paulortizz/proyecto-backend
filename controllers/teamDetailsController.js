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

// Obtener todos los partidos jugados por un equipo, organizados por liga
exports.getAllMatchesByTeam = async (req, res) => {
    const { teamId } = req.params;

    if (!teamId) {
        return res.status(400).json({ status: 'error', message: 'Team ID is required' });
    }

    try {
        // Consultar la API para obtener todos los partidos del equipo en la temporada actual
        const season = new Date().getFullYear(); // Suponiendo que la temporada actual coincide con el año actual
        const response = await footballApi.get(`/fixtures?team=${teamId}&season=${season}`);
        const matches = response.data.response;

        if (!matches || matches.length === 0) {
            return res.status(404).json({ status: 'error', message: 'No matches found for this team' });
        }

        // Organizar partidos por liga
        const matchesByCompetition = {};

        matches.forEach((match) => {
            const leagueId = match.league.id;
            const leagueName = match.league.name;
            const leagueLogo = match.league.logo;

            if (!matchesByCompetition[leagueId]) {
                matchesByCompetition[leagueId] = {
                    leagueName: leagueName,
                    leagueLogo: leagueLogo,
                    matches: [],
                };
            }

            matchesByCompetition[leagueId].matches.push({
                fixtureId: match.fixture.id,
                date: match.fixture.date,
                venue: {
                    name: match.fixture.venue.name,
                    city: match.fixture.venue.city,
                },
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

        // Convertir el objeto en un array para mejor manejo
        const result = Object.values(matchesByCompetition).sort((a, b) => a.leagueName.localeCompare(b.leagueName));

        res.status(200).json({ status: 'success', data: result });
    } catch (error) {
        console.error('Error fetching matches:', error.message);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

// Obtener partidos de un equipo filtrados por liga
exports.getMatchesByLeague = async (req, res) => {
    const { teamId, leagueId } = req.params;

    if (!teamId || !leagueId) {
        return res.status(400).json({ status: 'error', message: 'Team ID and League ID are required' });
    }

    try {
        // Obtener partidos del equipo en la liga específica y temporada actual
        const season = new Date().getFullYear(); // Ajustar según la lógica de temporadas
        const response = await footballApi.get(`/fixtures?team=${teamId}&league=${leagueId}&season=${season}`);
        const matches = response.data.response;

        if (!matches || matches.length === 0) {
            return res.status(404).json({ status: 'error', message: 'No matches found for this team in the specified league' });
        }

        // Formatear los datos de los partidos
        const formattedMatches = matches.map((match) => ({
            fixtureId: match.fixture.id,
            date: match.fixture.date,
            venue: {
                name: match.fixture.venue.name,
                city: match.fixture.venue.city,
            },
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
        }));

        res.status(200).json({ status: 'success', data: formattedMatches });
    } catch (error) {
        console.error('Error fetching matches by league:', error.message);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
