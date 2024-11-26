const express = require('express');
const router = express.Router();
const leagueDetailsController = require('../controllers/leagueDetailsController'); // Asegúrate de que la ruta es correcta

// Definir las rutas con las funciones de callback
router.get('/details/:id', leagueDetailsController.getLeagueDetails);
router.get('/fixtures/upcoming/:id', leagueDetailsController.getUpcomingFixtures);
router.get('/fixtures/recent/:id', leagueDetailsController.getRecentResults);
router.get('/standings/:id', leagueDetailsController.getStandings);

module.exports = router;
