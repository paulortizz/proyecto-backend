const footballApi = require('../utils/footballApi');

exports.getTeamsByLeague = async (req, res) => {
    const { leagueId, season } = req.params;

    try {
        // Realiza la solicitud a la API externa para obtener los equipos
        const response = await footballApi.get('/teams', { params: { league: leagueId, season } });

        if (!response.data || response.data.response.length === 0) {
            return res.status(404).json({ message: 'No se encontraron equipos para la liga y temporada especificadas' });
        }

        // Filtra los datos eliminando propiedades con valor null en team y venue
        const filteredData = response.data.response.map(teamData => {
            const cleanTeam = Object.fromEntries(
                Object.entries(teamData.team).filter(([_, value]) => value !== null)
            );
            const cleanVenue = Object.fromEntries(
                Object.entries(teamData.venue).filter(([_, value]) => value !== null)
            );

            return {
                team: cleanTeam,
                venue: cleanVenue,
            };
        });

        // Respuesta con datos filtrados
        res.status(200).json({ status: 'success', data: filteredData });
    } catch (error) {
        console.error('Error al obtener equipos:', error.message || error);

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
