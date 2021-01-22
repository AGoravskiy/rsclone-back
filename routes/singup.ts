import { Router } from 'express';

const router = Router();

router.post('/', async (req, res, next) => {
  const { email, password, name } = req.body;
  if (email && password && name) {
    const token = 'zalupa';
    const refreshToken = '2zalupi';
    res.status(200).json({
      status: 'ok',
      code: 200,
      payload: {
        token,
        refreshToken,
      },
    });
  } else {
    res.status(401).json({ status: 'fail', code: 401, message: 'Wrong data.' });
  }
});

export default router;
