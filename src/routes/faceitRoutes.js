const express = require('express');
const faceitController = require('../controllers/faceitController');

const router = express.Router();

router.get('/player/stats/:playerId', faceitController.getPlayerStats);
router.get('/match/:matchId', faceitController.getMatchDetails);

module.exports = router;
