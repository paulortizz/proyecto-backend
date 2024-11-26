const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const teamsController = require('../controllers/teamsController'); // Asegúrate de que el controlador esté correctamente referenciado

// Ruta para obtener equipos por leagueId y season
router.get('/:leagueId/:season', [
    // Validar que 'leagueId' sea un número positivo y 'season' un año válido
    check('leagueId')
        .isInt({ min: 1 }).withMessage('leagueId debe ser un número entero positivo'),
    check('season')
        .isInt({ min: 2000, max: new Date().getFullYear() }).withMessage('season debe ser un año válido')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        // Llamar al controlador para obtener equipos por liga
        await teamsController.getTeamsByLeague(req, res);
    } catch (error) {
        console.error('Error al obtener equipos:', error);
        res.status(500).json({ success: false, message: 'Error interno al obtener equipos' });
    }
});

module.exports = router;
