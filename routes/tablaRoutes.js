const express = require('express');
const router = express.Router();
const tablasController = require('../controllers/tablasController');

// Ruta para obtener las tablas de posiciones
router.get('/:leagueId/:season', tablasController.getStandings2);

module.exports = router;
