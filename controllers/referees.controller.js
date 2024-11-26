const footballApi = require('../utils/footballApi');

exports.getRefereeOverviewWithDetails = async (req, res) => {
    const leagueId = req.params.leagueId;
    const season = req.query.season;

    if (!leagueId || !season) {
        return res.status(400).json({ status: 'error', message: 'League ID and season are required' });
    }

    try {
        // Obtener todos los partidos de la liga y temporada
        const response = await footballApi.get(`/fixtures?league=${leagueId}&season=${season}`);
        const fixtures = response.data.response;

        if (!fixtures || fixtures.length === 0) {
            return res.status(404).json({ status: 'error', message: 'No matches found for this league and season' });
        }

        // Obtener información de la liga para extraer país o entidad organizadora
        const leagueResponse = await footballApi.get(`/leagues?id=${leagueId}`);
        const leagueData = leagueResponse.data.response[0];
        const leagueCountry = leagueData?.country?.name || 'Unknown';
        const leagueOrganization = leagueData?.country?.code || 'Unknown';

        // Extraer árbitros únicos con estadísticas
        const refereeData = {};
        fixtures.forEach((fixture) => {
            const referee = fixture.fixture.referee;
            if (referee) {
                if (!refereeData[referee]) {
                    refereeData[referee] = {
                        name: referee,
                        countryOrOrganization: leagueCountry || leagueOrganization,
                        matchesArbitrated: 0,
                        yellowCards: 0,
                        redCards: 0,
                        mostCommonStadiums: {},
                        lastFiveMatches: [],
                    };
                }

                // Incrementar contador de partidos arbitrados
                refereeData[referee].matchesArbitrated += 1;

                // Agregar estadios más comunes
                const stadium = fixture.fixture.venue.name;
                if (stadium) {
                    refereeData[referee].mostCommonStadiums[stadium] =
                        (refereeData[referee].mostCommonStadiums[stadium] || 0) + 1;
                }

                // Agregar partidos recientes
                if (refereeData[referee].lastFiveMatches.length < 5) {
                    refereeData[referee].lastFiveMatches.push({
                        date: fixture.fixture.date,
                        home: fixture.teams.home.name,
                        away: fixture.teams.away.name,
                        score: `${fixture.goals.home} - ${fixture.goals.away}`,
                        stadium: stadium,
                    });
                }
            }
        });

        // Convertir estadios más comunes a un array ordenado
        Object.keys(refereeData).forEach((referee) => {
            refereeData[referee].mostCommonStadiums = Object.entries(refereeData[referee].mostCommonStadiums)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3) // Mostrar los 3 estadios más comunes
                .map(([name, count]) => ({ name, count }));
        });

        // Agrupar árbitros por país u organización
        const groupedReferees = {};
        const defaultGroup = 'Unknown'; // Para árbitros sin país u organización válida
        Object.values(refereeData).forEach((referee) => {
            const group = referee.countryOrOrganization || defaultGroup;
            if (!groupedReferees[group]) {
                groupedReferees[group] = [];
            }
            groupedReferees[group].push(referee);
        });

        // Ordenar árbitros dentro de cada grupo por número de partidos arbitrados
        Object.keys(groupedReferees).forEach((group) => {
            groupedReferees[group].sort((a, b) => b.matchesArbitrated - a.matchesArbitrated);
        });

        res.status(200).json({ status: 'success', data: groupedReferees });
    } catch (error) {
        console.error('Error fetching referee overview with details:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
