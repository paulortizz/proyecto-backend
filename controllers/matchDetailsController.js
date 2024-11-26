const footballApi = require('../utils/footballApi');

// Obtener detalles de un partido específico
exports.getMatchDetails = async (req, res) => {
    const matchId = req.params.id;

    if (!matchId) {
        return res.status(400).json({ message: 'El ID del partido es obligatorio' });
    }

    try {
        // Llamada a la API de Football Data
        const response = await footballApi.get(`/fixtures?id=${matchId}`);

        // Verificar si se obtuvo información del partido
        if (!response.data || response.data.response.length === 0) {
            return res.status(404).json({ message: 'Detalles del partido no encontrados' });
        }

        const matchData = response.data.response[0];

        // Calcular posiciones de los jugadores
        const calculatePlayerPositions = (lineup, isHomeTeam) => {
            // Ejemplo de asignación de posiciones (puedes ajustarlo según la formación del equipo)
            const formation = lineup.formation.split('-').map(num => parseInt(num));
            let row = 10; // Última fila para portero
            let positions = [];
            let columnOffset = isHomeTeam ? 1 : 5; // Equipo local a la izquierda, visitante a la derecha

            formation.forEach((numPlayers, index) => {
                const startColumn = Math.ceil((5 - numPlayers) / 2) + 1;
                for (let i = 0; i < numPlayers; i++) {
                    positions.push({
                        gridRow: row - index,
                        gridColumn: startColumn + i + columnOffset - 3
                    });
                }
            });

            return positions;
        };

        const lineups = matchData.lineups.map((lineup, index) => {
            const positions = calculatePlayerPositions(lineup, index === 0);
            return {
                team: lineup.team.name,
                formation: lineup.formation,
                players: lineup.startXI.map((player, i) => ({
                    ...player,
                    position: positions[i] || null
                })),
                substitutes: lineup.substitutes,
                coach: lineup.coach
            };
        });

        // Estructuración de la respuesta
        const matchDetails = {
            fixture: {
                id: matchData.fixture.id,
                date: matchData.fixture.date,
                status: matchData.fixture.status.long,
                elapsed: matchData.fixture.status.elapsed, // Minutos jugados
                venue: {
                    name: matchData.fixture.venue?.name || 'N/A',
                    city: matchData.fixture.venue?.city || 'N/A'
                },
                referee: matchData.fixture.referee || 'No especificado', // Árbitro
            },
            league: {
                id: matchData.league.id,
                name: matchData.league.name,
                country: matchData.league.country,
                logo: matchData.league.logo,
                season: matchData.league.season,
                round: matchData.league.round,
            },
            teams: {
                home: {
                    id: matchData.teams.home.id,
                    name: matchData.teams.home.name,
                    logo: matchData.teams.home.logo,
                    winner: matchData.teams.home.winner // Estado de ganador
                },
                away: {
                    id: matchData.teams.away.id,
                    name: matchData.teams.away.name,
                    logo: matchData.teams.away.logo,
                    winner: matchData.teams.away.winner // Estado de ganador
                },
            },
            goals: {
                home: matchData.goals.home,
                away: matchData.goals.away,
            },
            score: matchData.score,
            events: matchData.events.map(event => ({
                time: event.time.elapsed + (event.time.extra ? `+${event.time.extra}` : ''),
                team: event.team.name,
                player: event.player.name,
                type: event.type,
                detail: event.detail
            })),
            lineups,
            statistics: matchData.statistics.map(stat => ({
                team: stat.team.name,
                stats: stat.statistics
            }))
        };

        // Enviar la respuesta estructurada
        res.status(200).json({ status: 'success', data: matchDetails });
    } catch (error) {
        console.error('Error al obtener detalles del partido:', error.message || error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
