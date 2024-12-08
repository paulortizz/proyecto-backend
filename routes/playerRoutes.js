const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

// Ruta para obtener información personal de un jugador
router.get('/info', playerController.getPlayerInfo);

module.exports = router;
