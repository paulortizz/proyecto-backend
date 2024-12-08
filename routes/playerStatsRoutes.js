const express = require('express');
const router = express.Router();
const playerStatsController = require('../controllers/playerStatsController');

// Ruta para obtener estadísticas de jugadores
router.get('/players/stats', playerStatsController.getPlayerStats);

module.exports = router;
