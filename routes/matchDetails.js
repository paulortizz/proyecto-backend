const express = require('express');
const router = express.Router();
const matchDetailsController = require('../controllers/matchDetailsController');

// Ruta para obtener detalles del partido
router.get('/match/details/:id', matchDetailsController.getMatchDetails);

module.exports = router;
