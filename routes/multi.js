const express = require('express');
const passport = require('passport');

const game = false;
const router = express.Router();

router.get('/check-game', async (req, res, next) => {
  if (game) {
    game = !game;
    res.status(200).json({ status: 'ok', code: 200, game, message: 'the game is ready'});
  } else {
    game = !game; 
    res.status(403).json({ status: 'created', code: 403, game, message: 'waiting for the enemy...'});
  }
});

module.exports = router;
