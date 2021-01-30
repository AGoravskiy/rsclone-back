const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const {
  getTokenFromRequesst,
  accessTokenKey,
  refreshTokenKey,
} = require('../utils/jwt');

const tokenList = [];
const getUserByAccessToken = (accessToken) => {
  const desiredUser = tokenList.find(
    (user) => user.accessToken === accessToken
  );
  return desiredUser || null;
};

const router = express.Router();

router.get('/status', (req, res, next) => {
  res.status(200);
  res.json({ status: 'ok' });
});

router.post(
  '/signup',
  passport.authenticate('signup', { session: false }),
  async (req, res, next) => {
    res
      .status(200)
      .json({ status: 'ok', code: 200, message: 'signup successful' });
  }
);

router.post('/login', async (req, res, next) => {
  passport.authenticate('login', async (err, user, info) => {
    try {
      if (!user) {
        return res
          .status(401)
          .json({ status: 'fail', code: 401, message: 'Email or Password is incorrect' });
      }
      if (err) {
        const error = new Error('An Error occured');
        return next(error);
      }
      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);
        const body = {
          _id: user._id,
          email: user.email,
        };
        console.log(body);
        const token = jwt.sign({ user: body }, accessTokenKey, {
          expiresIn: 300,
        });
        const refreshToken = jwt.sign({ user: body }, refreshTokenKey, {
          expiresIn: 86400,
        });
        // store tokens in memory
        tokenList.push({
          token,
          refreshToken,
          email: user.email,
          _id: user._id,
        });
        // Send back the token to the user
        return res
          .status(200)
          .json({ status: 'ok', code: 200, token, refreshToken });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});

router.post('/logout', (req, res) => {
  const accessToken = getTokenFromRequesst(req);
  const desiredUserIndex = tokenList.findIndex(
    (user) => user.accessToken === accessToken
  );
  if (desiredUserIndex !== -1) {
    tokenList.splice(desiredUserIndex, 1);
  }
  res.status(200).json({ message: 'logged out' });
});

router.post('/check-token', (req, res) => {
  try {
    const accessToken = getTokenFromRequesst(req);
    if (!accessToken) {
      throw new Error('Token is missing');
    }
    const { _id, email } = jwt.decode(accessToken);
    const desiredUser = getUserByAccessToken(accessToken);
    if (desiredUser !== null) {
      const user = { email, _id };
      const token = jwt.sign({ user }, accessTokenKey, {
        expiresIn: 300,
      });
      res.status(200).json({ status: 'ok', code: 200 });
    } else {
      res.status(401).json({
        message: 'Unauthorized',
        status: 'fail',
        code: 401,
        tokenList: tokenList,
      });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/refresh-token', (req, res, next) => {
  const { refreshToken } = req.body;
  const { _id, email } = jwt.decode(refreshToken);
  console.log('🚀 ~ file: user.js ~ line 112 ~ router.post ~ email', email);
});

module.exports = router;
