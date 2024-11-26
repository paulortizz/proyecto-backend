const footballApi = require('../utils/footballApi');

// Controlador para obtener los partidos del día y en vivo
exports.getMatchesToday = async (req, res) => {
    try {
        // Obtener todos los partidos del día
        const today = new Date().toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD
        const responseToday = await footballApi.get(`/fixtures?date=${today}`);

        // Obtener partidos en vivo
        const responseLive = await footballApi.get(`/fixtures?live=all`);

        // Preparar las respuestas
        const allMatches = responseToday.data?.response || [];
        const liveMatches = responseLive.data?.response || [];

        res.status(200).json({
            status: 'success',
            data: {
                allMatches,
                liveMatches
            }
        });
    } catch (error) {
        console.error('Error al obtener los partidos:', error.message || error);
        res.status(500).json({
            status: 'error',
            message: 'Error al obtener los partidos.'
        });
    }
};
