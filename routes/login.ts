import { Router } from 'express';

const router = Router();

router.post('/', (req, res, next) => {
  const { email, password } = req.body;
  if (email === 'test4@test.com' && password === '1234') {
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
    res.status(401).json({ status: 'fail', code: 401, message: 'You are not authorized.' });
  }
});

export default router;
