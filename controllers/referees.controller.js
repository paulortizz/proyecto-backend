const footballApi = require('../utils/footballApi');

// Controlador principal
exports.getRefereeOverviewWithDetails = async (req, res) => {
    const leagueId = req.params.leagueId;
    const season = req.query.season;

    if (!leagueId || !season) {
        return res.status(400).json({ status: 'error', message: 'League ID and season are required' });
    }

    try {
        // Obtener fixtures y datos de la liga
        const fixtures = await fetchFixtures(leagueId, season);
        const leagueInfo = await fetchLeagueInfo(leagueId);

        if (!fixtures.length) {
            return res.status(404).json({ status: 'error', message: 'No matches found for this league and season' });
        }

        // Procesar datos de los árbitros
        const refereeData = processRefereeData(fixtures, leagueInfo, season);

        // Agrupar árbitros por país u organización
        const groupedReferees = groupRefereesByCountry(refereeData);

        res.status(200).json({
            status: 'success',
            data: groupedReferees,
            seasons: leagueInfo.seasons, // Temporadas disponibles para la liga
        });
    } catch (error) {
        console.error('Error fetching referee overview with details:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

// Función para obtener los partidos (fixtures)
async function fetchFixtures(leagueId, season) {
    const response = await footballApi.get(`/fixtures?league=${leagueId}&season=${season}`);
    return response.data.response || [];
}

// Función para obtener información de la liga
async function fetchLeagueInfo(leagueId) {
    const leagueResponse = await footballApi.get(`/leagues?id=${leagueId}`);
    const leagueData = leagueResponse.data.response[0];
    const seasonHistory = await footballApi.get(`/leagues/seasons?id=${leagueId}`);

    return {
        country: leagueData?.country?.name || 'Unknown',
        organization: leagueData?.country?.code || 'Unknown',
        seasons: seasonHistory.data.response || [],
    };
}

// Función para procesar datos de los árbitros
function processRefereeData(fixtures, leagueInfo, season) {
    const refereeData = {};

    fixtures.forEach((fixture) => {
        const referee = fixture.fixture.referee;
        if (!referee) return;

        if (!refereeData[referee]) {
            refereeData[referee] = initializeRefereeData(referee, leagueInfo);
        }

        updateRefereeData(refereeData[referee], fixture, season);
    });

    return refereeData;
}

// Inicializar datos del árbitro
function initializeRefereeData(referee, leagueInfo) {
    return {
        name: referee,
        countryOrOrganization: leagueInfo.country || leagueInfo.organization,
        matchesArbitrated: 0,
        yellowCards: 0,
        redCards: 0,
        penaltiesAwarded: 0,
        foulsCommitted: 0,
        offsidesCalled: 0,
        mostCommonStadiums: {},
        historicalStats: {},
    };
}

// Actualizar datos del árbitro
function updateRefereeData(referee, fixture, season) {
    referee.matchesArbitrated += 1;
    referee.yellowCards += fixture.statistics?.cards?.yellow || 0;
    referee.redCards += fixture.statistics?.cards?.red || 0;
    referee.penaltiesAwarded += fixture.statistics?.penalties?.awarded || 0;
    referee.foulsCommitted += fixture.statistics?.fouls?.committed || 0;
    referee.offsidesCalled += fixture.statistics?.offsides || 0;

    if (!referee.historicalStats[season]) {
        referee.historicalStats[season] = {
            matches: 0,
            yellowCards: 0,
            redCards: 0,
            penaltiesAwarded: 0,
            foulsCommitted: 0,
            offsidesCalled: 0,
        };
    }

    referee.historicalStats[season].matches += 1;
    referee.historicalStats[season].yellowCards += fixture.statistics?.cards?.yellow || 0;
    referee.historicalStats[season].redCards += fixture.statistics?.cards?.red || 0;
    referee.historicalStats[season].penaltiesAwarded += fixture.statistics?.penalties?.awarded || 0;
    referee.historicalStats[season].foulsCommitted += fixture.statistics?.fouls?.committed || 0;
    referee.historicalStats[season].offsidesCalled += fixture.statistics?.offsides || 0;

    const stadium = fixture.fixture.venue.name;
    if (stadium) {
        referee.mostCommonStadiums[stadium] = (referee.mostCommonStadiums[stadium] || 0) + 1;
    }
}

// Agrupar árbitros por país u organización
function groupRefereesByCountry(refereeData) {
    const groupedReferees = {};
    const defaultGroup = 'Unknown';

    Object.values(refereeData).forEach((referee) => {
        const group = referee.countryOrOrganization || defaultGroup;
        if (!groupedReferees[group]) {
            groupedReferees[group] = [];
        }
        groupedReferees[group].push(referee);
    });

    Object.keys(groupedReferees).forEach((group) => {
        groupedReferees[group].sort((a, b) => b.matchesArbitrated - a.matchesArbitrated);
    });

    return groupedReferees;
}
