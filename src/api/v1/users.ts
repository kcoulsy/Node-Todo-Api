import express from 'express';
import { authenticate } from '../../middleware/authenticate.middleware';
import _ from 'lodash';
import {
  clearUserTokens,
  loginUser,
  registerUser,
} from '../../services/user.service';

const router = express.Router();

router.post('/', async (req, res, next) => {
  var body = _.pick(req.body, ['email', 'password']);

  try {
    const { user, token } = await registerUser({
      email: body.email,
      password: body.password,
    });
    await user.save();

    res.header('x-auth', token).send(user);
  } catch (e) {
    next(e);
  }
});

router.get('/me', authenticate, (req, res) => {
  // @ts-ignore
  res.send(req.user);
});

router.post('/login', async (req, res, next) => {
  var body = _.pick(req.body, ['email', 'password']);

  try {
    const { user, token } = await loginUser({
      email: body.email,
      password: body.password,
    });

    res.header('x-auth', token).send(user);
  } catch (e) {
    next(e);
  }
});

router.delete('/logout', authenticate, async (req, res, next) => {
  try {
    // @ts-ignore
    await clearUserTokens({ userId: req.user._id.toHexString() });
    res.header('x-auth', '').status(200).send();
  } catch (e) {
    next(e);
  }
});

export default router;
