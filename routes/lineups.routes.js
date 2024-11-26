const express = require('express');
const router = express.Router();
const lineupsController = require('../controllers/lineupsController');

// Ruta para obtener alineaciones de un partido específico
router.get('/:matchId', lineupsController.getLineups);

module.exports = router;
