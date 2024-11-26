const footballApi = require('../utils/footballApi');

// Controlador para obtener las alineaciones de un partido específico
exports.getLineups = async (req, res) => {
    const matchId = req.params.matchId;

    if (!matchId) {
        return res.status(400).json({ message: 'El ID del partido es obligatorio.' });
    }

    try {
        const response = await footballApi.get(`/fixtures/lineups?fixture=${matchId}`);

        if (!response.data || !Array.isArray(response.data.response) || response.data.response.length === 0) {
            return res.status(404).json({ message: 'Alineaciones no encontradas para este partido.' });
        }

        const lineupData = response.data.response;

        const calculatePlayerPositions = (formation, isHomeTeam) => {
            if (!formation) return [];
            const parsedFormation = formation.split('-').map(num => parseInt(num, 10));
            const row = 11; // Altura máxima del campo (portero en la fila 11)
            const positions = [];
            const columnOffset = isHomeTeam ? 0 : 10; // Offset para separar equipos
          
            // Posición del portero
            positions.push({ gridRow: row, gridColumn: 10 + columnOffset });
          
            // Jugadores de campo
            parsedFormation.forEach((numPlayers, index) => {
              const startColumn = Math.floor((20 - numPlayers * 2) / 2) + 1; // Centrado dinámico
              for (let i = 0; i < numPlayers; i++) {
                positions.push({
                  gridRow: row - index - 1, // Filas decrecientes
                  gridColumn: startColumn + i * 2 + columnOffset, // Separar columnas
                });
              }
            });
          
            return positions;
          };
          
          
        
                
        const lineups = lineupData.map((lineup, index) => {
            const positions = calculatePlayerPositions(lineup.formation, index === 0);

            return {
                team: lineup.team?.name || 'Unknown Team',
                formation: lineup.formation || 'Unknown Formation',
                players: Array.isArray(lineup.startXI)
                    ? lineup.startXI.map((player, i) => ({
                        id: player?.player?.id ?? null,
                        name: player?.player?.name || 'Unknown Player',
                        number: player?.player?.number ?? 'N/A',
                        position: positions[i] || null,
                        pos: player?.player?.pos || 'Unknown Position',
                        events: Array.isArray(lineup.events)
                            ? lineup.events.filter(e => e.player?.id === player?.player?.id)
                            : [],
                    }))
                    : [],
                substitutes: Array.isArray(lineup.substitutes)
                    ? lineup.substitutes.map(sub => ({
                        id: sub?.player?.id ?? null,
                        name: sub?.player?.name || 'Unknown Substitute',
                        number: sub?.player?.number ?? 'N/A',
                        pos: sub?.player?.pos || 'Unknown Position',
                    }))
                    : [],
                coach: lineup.coach?.name || 'No especificado',
                totalPlayers: lineup.startXI?.length || 0,
                totalSubstitutes: lineup.substitutes?.length || 0,
            };
        });

        res.status(200).json({
            status: 'success',
            data: { matchId, lineups },
        });
    } catch (error) {
        console.error('Error al obtener alineaciones:', {
            message: error.message,
            stack: error.stack,
        });
        res.status(500).json({
            message: 'Error interno del servidor.',
            error: error.message,
        });
    }
};
