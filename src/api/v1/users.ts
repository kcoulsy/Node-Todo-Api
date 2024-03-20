import Router from 'express-promise-router';
import { authenticate } from '../../middleware/authenticate.middleware';
import _ from 'lodash';
import {
  clearUserRefreshToken,
  loginUser,
  registerUser,
} from '../../services/user.service';

const router = Router();

router.post('/', async (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);

  const { user, accessToken, refreshToken } = await registerUser({
    email: body.email,
    password: body.password,
  });

  res.send({ user, accessToken, refreshToken });
});

router.get('/me', authenticate, (req, res) => {
  res.send(req.userId);
});

router.post('/login', async (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);

  const { user, accessToken, refreshToken } = await loginUser({
    email: body.email,
    password: body.password,
  });

  res.send({ user, accessToken, refreshToken });
});

router.delete('/logout', authenticate, async (req, res) => {
  await clearUserRefreshToken({ userId: req.userId || '' });
  res.header('x-auth', '').status(200).send();
});

export default router;
