const express = require('express');
const router = express.Router();
const leaguesController = require('../controllers/leaguesController');

// Ruta para obtener todas las ligas
router.get('/', leaguesController.getLeagues);

// Ruta para obtener ligas por temporada
router.get('/:season', leaguesController.getLeaguesBySeason);


module.exports = router; 