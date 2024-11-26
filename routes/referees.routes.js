const express = require('express');
const router = express.Router();
const refereesController = require('../controllers/referees.controller');

// Ruta para obtener la información detallada de los árbitros de una competición
router.get('/overview/:leagueId', refereesController.getRefereeOverviewWithDetails);

module.exports = router;
