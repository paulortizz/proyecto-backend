const express = require('express');
const router = express.Router();
const teamsController = require('../controllers/teamsController');

// Rutas para equipos
router.get('/', teamsController.getTeams); // Obtener lista de equipos con búsqueda opcional
router.get('/:teamId/details', teamsController.getTeamDetails); // Obtener detalles de un equipo
router.get('/:teamId/matches', teamsController.getTeamMatches); // Obtener partidos de un equipo

module.exports = router;
