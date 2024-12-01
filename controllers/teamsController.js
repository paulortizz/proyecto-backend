const footballApi = require('../utils/footballApi');

// Obtener lista de equipos por liga, temporada y búsqueda opcional
exports.getTeams = async (req, res) => {
    const { leagueId, season, search } = req.query;

    const leagueIdNumber = leagueId ? parseInt(leagueId, 10) : null;
    const seasonNumber = season ? parseInt(season, 10) : null;

    // Validar si falta leagueId o season en la solicitud
    if ((!leagueIdNumber || !seasonNumber) && !search) {
        return res.status(400).json({ 
            status: 'error', 
            message: 'League ID, season, or a search query is required' 
        });
    }

    try {
        let teams = [];
        if (leagueIdNumber && seasonNumber) {
            // Obtener equipos por liga y temporada
            const response = await footballApi.get(`/teams?league=${leagueIdNumber}&season=${seasonNumber}`);

            if (!response || !response.data || !Array.isArray(response.data.response)) {
                return res.status(500).json({ 
                    status: 'error', 
                    message: 'Invalid response from external API' 
                });
            }

            teams = response.data.response;
        }

        // Filtrar equipos por término de búsqueda (global o dentro de la liga/temporada especificada)
        if (search) {
            const searchResponse = await footballApi.get(`/teams?search=${search}`);
            const searchedTeams = searchResponse.data.response || [];
            teams = [...teams, ...searchedTeams];
        }

        // Mapear los datos
        const mappedTeams = teams.map(item => ({
            id: item.team.id,
            name: item.team.name,
            logo: item.team.logo || null,
            country: item.team.country,
            founded: item.team.founded || 'Unknown',
            venue: {
                name: item.venue?.name || 'Unknown Venue',
                city: item.venue?.city || 'Unknown City',
                capacity: item.venue?.capacity || 0
            }
        }));

        // Eliminar duplicados si se combinan resultados
        const uniqueTeams = Array.from(new Map(mappedTeams.map(team => [team.id, team])).values());

        if (!uniqueTeams || uniqueTeams.length === 0) {
            return res.status(404).json({ status: 'error', message: 'No teams found for this league, season, or search query' });
        }

        res.status(200).json({ status: 'success', data: uniqueTeams });
    } catch (error) {
        console.error('Error fetching teams:', {
            error: error.message,
            stack: error.stack,
            details: error.response?.data || 'No additional details'
        });
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

// Obtener detalles de un equipo específico
exports.getTeamDetails = async (req, res) => {
    const { teamId } = req.params;

    if (!teamId) {
        return res.status(400).json({ status: 'error', message: 'Team ID is required' });
    }

    try {
        const response = await footballApi.get(`/teams?id=${teamId}`);
        const team = response.data.response[0];

        if (!team) {
            return res.status(404).json({ status: 'error', message: 'Team not found' });
        }

        res.status(200).json({ status: 'success', data: team });
    } catch (error) {
        console.error('Error fetching team details:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

// Obtener partidos jugados por un equipo
exports.getTeamMatches = async (req, res) => {
    const { teamId } = req.params;
    const { season } = req.query;

    const seasonNumber = parseInt(season, 10);

    if (!teamId || isNaN(seasonNumber)) {
        return res.status(400).json({ 
            status: 'error', 
            message: 'Team ID and season are required and must be valid' 
        });
    }

    try {
        const response = await footballApi.get(`/fixtures?team=${teamId}&season=${seasonNumber}`);
        const matches = response.data.response;

        if (!matches || matches.length === 0) {
            return res.status(404).json({ status: 'error', message: 'No matches found for this team and season' });
        }

        res.status(200).json({ status: 'success', data: matches });
    } catch (error) {
        console.error('Error fetching team matches:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};