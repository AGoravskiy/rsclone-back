const express = require('express');
const asyncMiddleware = require('../middleware/asyncMiddleware');
const UserModel = require('../models/userModel');

const router = express.Router();

router.post(
  '/submit-game',
  asyncMiddleware(async (req, res, next) => {
    const { email, game } = req.body;
    const queryResult = await UserModel.updateOne(
      { email },
      { $push: { games: game } }
      // done
    );
    res.status(200).json({ status: 'ok' });
  })
);

router.get(
  '/scores',
  asyncMiddleware(async (req, res, next) => {
    const users = await UserModel.find({}, 'name games -_id');
    res.status(200).json(users);
  })
);

module.exports = router;
