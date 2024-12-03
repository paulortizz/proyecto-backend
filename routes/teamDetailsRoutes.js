const express = require('express');
const router = express.Router();
const teamDetailsController = require('../controllers/teamDetailsController');

router.get('/:teamId/overview', teamDetailsController.getTeamOverview);
router.get('/:teamId/matches', teamDetailsController.getAllMatchesByTeam);
router.get('/:teamId/league/:leagueId', teamDetailsController.getMatchesByLeague);



module.exports = router;
