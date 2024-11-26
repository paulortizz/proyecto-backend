const footballApi = require('../utils/footballApi');

// Obtener detalles de una liga específica
exports.getLeagueDetails = async (req, res) => {
    const leagueId = req.params.id;

    if (!leagueId) {
        return res.status(400).json({ message: 'El ID de la liga es obligatorio' });
    }

    try {
        const response = await footballApi.get(`/leagues?id=${leagueId}`);
        const leagueData = response?.data?.response?.[0];

        if (!leagueData) {
            return res.status(404).json({ message: 'Liga no encontrada' });
        }

        res.status(200).json({
            status: 'success',
            data: {
                league: {
                    ...leagueData.league,
                    logo: leagueData.league.logo || 'https://example.com/default-league-logo.png'
                },
                country: {
                    ...leagueData.country,
                    flag: leagueData.country.flag || 'https://example.com/default-flag.png'
                }
            }
        });
    } catch (error) {
        console.error('Error al obtener detalles de la liga:', error.message || error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Obtener próximos partidos de una liga específica agrupados por jornada
exports.getUpcomingFixtures = async (req, res) => {
    const leagueId = req.params.id;
    const season = req.query.season;

    if (!leagueId || !season) {
        return res.status(400).json({ message: 'El ID de la liga y la temporada son obligatorios' });
    }

    try {
        const response = await footballApi.get(`/fixtures?league=${leagueId}&season=${season}`);
        
        if (!response.data || response.data.response.length === 0) {
            return res.status(404).json({ message: 'No se encontraron partidos para la temporada solicitada' });
        }

        const fixtures = response.data.response.map(fixture => ({
            id: fixture.fixture.id,
            date: fixture.fixture.date,
            status: fixture.fixture.status.long,
            home: {
                name: fixture.teams.home.name,
                logo: fixture.teams.home.logo || 'https://example.com/default-team-logo.png'
            },
            away: {
                name: fixture.teams.away.name,
                logo: fixture.teams.away.logo || 'https://example.com/default-team-logo.png'
            }
        }));

        res.status(200).json({ status: 'success', data: fixtures });
    } catch (error) {
        console.error('Error al obtener partidos:', error.message || error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Obtener resultados recientes de una liga específica
exports.getRecentResults = async (req, res) => {
    const leagueId = req.params.id;
    const season = req.query.season;

    if (!leagueId || !season) {
        return res.status(400).json({ message: 'El ID de la liga y la temporada son obligatorios' });
    }

    try {
        const response = await footballApi.get(`/fixtures?league=${leagueId}&season=${season}&status=FT`);
        if (!response.data || response.data.response.length === 0) {
            return res.status(404).json({ message: 'No se encontraron resultados recientes' });
        }

        const results = response.data.response.map(result => ({
            id: result.fixture.id, // Incluir el ID del partido
            date: result.fixture.date,
            teams: {
                home: {
                    name: result.teams.home.name,
                    logo: result.teams.home.logo,
                },
                away: {
                    name: result.teams.away.name,
                    logo: result.teams.away.logo,
                },
            },
            goals: {
                home: result.goals.home,
                away: result.goals.away,
            },
            status: result.fixture.status.long,
        }));

        res.status(200).json({ status: 'success', data: results });
    } catch (error) {
        console.error('Error al obtener resultados recientes:', error.message || error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};



// Obtener la tabla de posiciones de una liga específica
exports.getStandings = async (req, res) => {
    const leagueId = req.params.id;
    const season = req.query.season || new Date().getFullYear();

    try {
        const response = await footballApi.get(`/standings?league=${leagueId}&season=${season}`);

        if (!response.data || response.data.response.length === 0) {
            return res.status(404).json({ message: 'No se encontró la tabla de posiciones para la temporada solicitada' });
        }

        const standings = response.data.response[0].league.standings[0].map(team => ({
            position: team.rank,
            team: {
                name: team.team.name,
                logo: team.team.logo || 'https://example.com/default-team-logo.png'
            },
            points: team.points,
            goalsDiff: team.goalsDiff,
            played: team.all.played,
            won: team.all.win,
            drawn: team.all.draw,
            lost: team.all.lose,
            goalsFor: team.all.goals.for,
            goalsAgainst: team.all.goals.against
        }));

        res.status(200).json({ status: 'success', data: standings });
    } catch (error) {
        console.error('Error al obtener la clasificación:', error.message || error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Obtener partidos en vivo de una liga específica
exports.getLiveFixtures = async (req, res) => {
    const leagueId = req.params.id;
    try {
        const response = await footballApi.get(`/fixtures?league=${leagueId}&status=LIVE`);
        if (!response.data || response.data.response.length === 0) {
            return res.status(404).json({ message: 'No se encontraron partidos en vivo' });
        }
        const liveFixtures = response.data.response.map(fixture => ({
            date: fixture.fixture.date,
            teams: fixture.teams,
            status: fixture.fixture.status,
            score: fixture.goals
        }));
        res.status(200).json({ status: 'success', data: liveFixtures });
    } catch (error) {
        console.error('Error al obtener partidos en vivo:', error.message || error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
