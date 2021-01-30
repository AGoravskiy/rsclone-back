const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const {
  getTokenFromRequesst,
  accessTokenKey,
  refreshTokenKey,
} = require('../utils/jwt');

const tokenList = [];
const getUserByEmail = (email) => {
  const desiredUser = tokenList.find((user) => user.email === email);
  return desiredUser || null;
};

const setUserAccessToken = (accessToken, email) => {
  const user = getUserByEmail(email);
  user.accessToken = accessToken;
  return user;
};

const signData = (body, tokenType = 'ACCESS') => {
  return jwt.sign(
    body,
    tokenType === 'ACCESS' ? accessTokenKey : refreshTokenKey,
    { expiresIn: tokenType === 'ACCESS' ? 300 : 86400 }
  );
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
      if (err || !user) {
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
        const token = signData({ user: body });
        const refreshToken = signData({ user: body }, 'REFRESH');
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

router.get('/check-token', (req, res) => {
  try {
    const accessToken = getTokenFromRequesst(req);
    if (!accessToken) {
      throw new Error('Token is missing');
    }
    const {
      user: { _id, email },
    } = jwt.verify(accessToken, accessTokenKey);
    const desiredUser = getUserByEmail(email);
    if (desiredUser !== null) {
      const user = { email, _id };
      const token = signData({ user });
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
    res.status(401).json({ error: e.message });
  }
});

router.post('/refresh-token', (req, res, next) => {
  try {
    if (!req.body || !req.body.refreshToken) {
      throw new Error('Refresh token not found');
    }
    const { refreshToken } = req.body;
    const decodedData = jwt.verify(refreshToken, refreshTokenKey);
    const { user: userInfo } = decodedData;
    const user = getUserByEmail(userInfo.email || '');
    if (!userInfo || !user) {
      throw new Error('User not found');
    }
    const accessToken = signData({
      user: {
        email: user.email,
        _id: user._id,
      },
    });
    setUserAccessToken(accessToken, user.email);
    res
      .status(200)
      .json({ status: 'ok', code: 200, accessToken, refreshToken });
  } catch (e) {
    res.status(400).json({ status: 'fail', error: e.message });
  }
});

module.exports = router;
