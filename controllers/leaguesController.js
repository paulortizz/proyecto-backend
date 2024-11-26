const footballApi = require('../utils/footballApi');

// Obtener todas las ligas
exports.getLeagues = async (req, res) => {
    try {
        const response = await footballApi.get('/leagues');

        // Si no hay datos o respuesta vacía, devuelve 404
        if (!response.data || response.data.response.length === 0) {
            return res.status(404).json({ message: 'No se encontraron ligas' });
        }

        // Devuelve solo los datos importantes de cada liga
        const leaguesData = response.data.response.map((league) => ({
            id: league.league.id,
            name: league.league.name,
            type: league.league.type,
            logo: league.league.logo,
            country: {
                name: league.country.name,
                code: league.country.code,
                flag: league.country.flag,
            },
            seasons: league.seasons.map(season => ({
                year: season.year,
                start: season.start,
                end: season.end,
                current: season.current,
                coverage: season.coverage, // Opcional: define si necesitas toda la cobertura o ciertos campos
            })),
        }));

        res.status(200).json({ status: 'success', data: leaguesData });
    } catch (error) {
        console.error('Error al obtener ligas:', error.message || error);

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

// Obtener ligas por temporada
exports.getLeaguesBySeason = async (req, res) => {
    const season = req.params.season; // Obtener la temporada desde los parámetros

    try {
        const response = await footballApi.get(`/leagues?season=${season}`); // Ajustar según la API

        // Si no hay datos o respuesta vacía, devuelve 404
        if (!response.data || response.data.response.length === 0) {
            return res.status(404).json({ message: 'No se encontraron ligas para la temporada especificada' });
        }

        // Similar a getLeagues, procesa los datos según sea necesario
        const leaguesData = response.data.response.map((league) => ({
            id: league.league.id,
            name: league.league.name,
            type: league.league.type,
            logo: league.league.logo,
            country: {
                name: league.country.name,
                code: league.country.code,
                flag: league.country.flag,
            },
            seasons: league.seasons.map(season => ({
                year: season.year,
                start: season.start,
                end: season.end,
                current: season.current,
                coverage: season.coverage,
            })),
        }));

        res.status(200).json({ status: 'success', data: leaguesData });
    } catch (error) {
        console.error('Error al obtener ligas por temporada:', error.message || error);

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
