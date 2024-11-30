const express = require('express');
const router = express.Router();
const teamDetailsController = require('../controllers/teamDetailsController');

// Ruta para obtener el overview de un equipo
router.get('/:teamId/overview', teamDetailsController.getTeamOverview);

module.exports = router;
