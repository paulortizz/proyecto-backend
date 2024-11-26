const express = require('express');
const router = express.Router();
const matchesController = require('../controllers/matchesController'); // Asegúrate de que la ruta sea correcta

// Ruta para obtener los partidos del día
router.get('/today', matchesController.getMatchesToday);

module.exports = router;
