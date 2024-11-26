const express = require('express');
const router = express.Router();
const playersController = require('../controllers/playersController');

// Obtener jugadores por equipo y temporada
router.get('/:teamId/:season', playersController.getPlayersByTeam);

module.exports = router;
