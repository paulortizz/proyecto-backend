const express = require('express');
const router = express.Router();
const teamMatchesController = require('../controllers/teamMatchesController');

// Ruta para obtener todos los partidos de un equipo
router.get('/:teamId/matches', teamMatchesController.getTeamMatches2);

module.exports = router;
