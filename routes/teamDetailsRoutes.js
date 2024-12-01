const express = require('express');
const router = express.Router();
const teamDetailsController = require('../controllers/teamDetailsController');

// Ruta para obtener el overview de un equipo
router.get('/:teamId/overview', teamDetailsController.getTeamOverview);

// Ruta para obtener todos los partidos jugados por un equipo, organizados por liga
router.get('/:teamId/all-matches', teamDetailsController.getAllMatchesByTeam);

// Obtener partidos por liga
router.get('/:teamId/league/:leagueId', teamDetailsController.getMatchesByLeague);


module.exports = router;
