import Router from 'express-promise-router';
import { authenticate } from '../../middleware/authenticate.middleware';
import _ from 'lodash';
import {
  clearUserTokens,
  loginUser,
  registerUser,
} from '../../services/user.service';

const router = Router();

router.post('/', async (req, res, next) => {
  var body = _.pick(req.body, ['email', 'password']);

  const { user, token } = await registerUser({
    email: body.email,
    password: body.password,
  });
  await user.save();

  res.header('x-auth', token).send(user);
});

router.get('/me', authenticate, (req, res) => {
  // @ts-ignore
  res.send(req.user);
});

router.post('/login', async (req, res, next) => {
  var body = _.pick(req.body, ['email', 'password']);

  const { user, token } = await loginUser({
    email: body.email,
    password: body.password,
  });

  res.header('x-auth', token).send(user);
});

router.delete('/logout', authenticate, async (req, res, next) => {
  // @ts-ignore
  await clearUserTokens({ userId: req.user._id.toHexString() });
  res.header('x-auth', '').status(200).send();
});

export default router;
