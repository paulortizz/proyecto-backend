const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');

router.get('/match/:matchId', statisticsController.getMatchStatistics);

module.exports = router;
