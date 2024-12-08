const footballApi = require('../utils/footballApi');

exports.getRefereeOverviewWithDetails = async (req, res) => {
    const leagueId = req.params.leagueId;
    const season = req.query.season;

    if (!leagueId || !season) {
        return res.status(400).json({ status: 'error', message: 'League ID and season are required' });
    }

    try {
        // Obtener los fixtures de la liga para la temporada especificada
        const fixturesResponse = await footballApi.get(`/fixtures?league=${leagueId}&season=${season}`);
        const fixtures = fixturesResponse.data.response || [];

        if (!fixtures.length) {
            return res.status(404).json({ status: 'error', message: 'No matches found for this league and season.' });
        }

        const refereeData = {};

        // Filtrar fixtures con árbitros definidos
        const fixturesWithReferees = fixtures.filter(fixture => fixture.fixture.referee);

        // Consolidar fixtures por árbitro
        fixturesWithReferees.forEach((fixture) => {
            const refereeName = fixture.fixture.referee;

            if (!refereeData[refereeName]) {
                refereeData[refereeName] = {
                    name: refereeName,
                    matchesArbitrated: 0,
                    yellowCards: 0,
                    redCards: 0,
                    mostCommonStadiums: {},
                };
            }

            refereeData[refereeName].matchesArbitrated++;

            // Actualizar estadios más comunes
            const stadiumName = fixture.fixture.venue?.name || 'Unknown Stadium';
            refereeData[refereeName].mostCommonStadiums[stadiumName] =
                (refereeData[refereeName].mostCommonStadiums[stadiumName] || 0) + 1;
        });

        // Obtener estadísticas solo para fixtures únicos por árbitro
        const uniqueFixtures = fixturesWithReferees.slice(0, 10); // Limitar a 10 fixtures únicos

        for (const fixture of uniqueFixtures) {
            const refereeName = fixture.fixture.referee;
            try {
                const statsResponse = await footballApi.get(`/fixtures/statistics?fixture=${fixture.fixture.id}`);
                const stats = statsResponse.data.response;

                if (stats && stats.length > 0) {
                    stats.forEach((teamStats) => {
                        if (teamStats.statistics) {
                            refereeData[refereeName].yellowCards +=
                                teamStats.statistics.find(stat => stat.type === 'Yellow Cards')?.value || 0;
                            refereeData[refereeName].redCards +=
                                teamStats.statistics.find(stat => stat.type === 'Red Cards')?.value || 0;
                        }
                    });
                }
            } catch (error) {
                console.warn(`No statistics found for fixture ${fixture.fixture.id}`);
            }
        }

        // Convertir los datos en un array y ordenar por número de partidos arbitrados
        const referees = Object.values(refereeData).map((referee) => {
            referee.mostCommonStadiums = Object.entries(referee.mostCommonStadiums)
                .map(([stadium, count]) => ({ stadium, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 3); // Solo los 3 estadios más comunes
            return referee;
        });

        res.status(200).json({
            status: 'success',
            data: referees,
        });
    } catch (error) {
        console.error('Error fetching referee details:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
