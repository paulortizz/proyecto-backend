const axios = require('axios');

// Obtener jugadores por equipo y temporada
exports.getPlayersByTeam = async (req, res) => {
    const { teamId, season } = req.params;

    // Limpiar el valor de season para eliminar espacios y saltos de línea
    const cleanedSeason = season.trim(); 

    try {
        const response = await axios.get('https://v3.football.api-sports.io/players', {
            headers: { 'x-apisports-key': process.env.API_KEY },
            params: { team: teamId, season: cleanedSeason }  // Usar cleanedSeason aquí
        });

        let players = response.data.response;

        // Filtrar campos null y dejar solo los más importantes
        players = players.map(player => {
            return {
                id: player.player.id,
                name: player.player.name,
                firstname: player.player.firstname,
                lastname: player.player.lastname,
                age: player.player.age,
                nationality: player.player.nationality,
                height: player.player.height || 'N/A',  // Mostrar 'N/A' si es null
                weight: player.player.weight || 'N/A',
                photo: player.player.photo,
                team: {
                    name: player.statistics[0].team.name,
                    logo: player.statistics[0].team.logo,
                },
                league: {
                    name: player.statistics[0].league.name,
                    country: player.statistics[0].league.country,
                    season: player.statistics[0].league.season
                },
                games: {
                    appearences: player.statistics[0].games.appearences,
                    position: player.statistics[0].games.position,
                    rating: player.statistics[0].games.rating || 'No rating'
                },
                goals: {
                    total: player.statistics[0].goals.total,
                    assists: player.statistics[0].goals.assists || 0
                },
                passes: {
                    total: player.statistics[0].passes.total || 0,
                    key: player.statistics[0].passes.key || 0
                },
                tackles: {
                    total: player.statistics[0].tackles.total || 0,
                    interceptions: player.statistics[0].tackles.interceptions || 0
                },
                cards: {
                    yellow: player.statistics[0].cards.yellow || 0,
                    red: player.statistics[0].cards.red || 0
                }
            };
        });

        res.status(200).json({ success: true, players });
    } catch (error) {
        console.error('Error al obtener jugadores:', error);
        res.status(500).json({ success: false, message: 'Error al obtener jugadores' });
    }
};
