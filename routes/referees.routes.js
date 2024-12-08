const express = require('express');
const router = express.Router();
const { getRefereeOverviewWithDetails } = require('../controllers/referees.controller'); // Verifica la ruta del archivo

router.get('/overview/:leagueId', getRefereeOverviewWithDetails);

module.exports = router;
