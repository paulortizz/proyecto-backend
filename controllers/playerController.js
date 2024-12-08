const footballApi = require('../utils/footballApi');

exports.getPlayerInfo = async (req, res) => {
    const { playerId, season } = req.query;

    if (!playerId || !season) {
        return res.status(400).json({ status: 'error', message: 'Player ID and season are required' });
    }

    try {
        // Realizar la solicitud a la API para obtener la información del jugador
        const playerResponse = await footballApi.get(`/players?id=${playerId}&season=${season}`);
        const playerData = playerResponse.data.response;

        if (!playerData || playerData.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Player not found.' });
        }

        // Extraer la información del jugador
        const player = playerData[0].player;
        const currentTeam = playerData[0].statistics[0]?.team || {};
        const jerseyNumber = playerData[0].statistics[0]?.games.number || 'N/A';

        // Preparar la respuesta con los datos requeridos
        const response = {
            id: player.id,
            name: player.name,
            fullName: `${player.firstname} ${player.lastname}`,
            age: player.age,
            birth: {
                date: player.birth.date,
                place: player.birth.place,
                country: player.birth.country,
            },
            nationality: player.nationality,
            height: player.height,
            weight: player.weight,
            photo: player.photo,
            currentTeam: {
                id: currentTeam.id,
                name: currentTeam.name,
                logo: currentTeam.logo,
            },
            jerseyNumber: jerseyNumber,
        };

        res.status(200).json({ status: 'success', data: response });
    } catch (error) {
        console.error('Error fetching player info:', error.response?.data || error.message);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
