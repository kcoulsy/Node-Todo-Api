import express, { Request } from 'express';
import { authenticate } from '../../middleware/authenticate.middleware';
import {
  User,
  generateAndSaveAuthToken,
  findByCredentials,
  removeTokenFromUser,
} from '../../models/user';
import _ from 'lodash';

const router = express.Router();

router.post('/', async (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);

  try {
    await user.save();

    const token = await generateAndSaveAuthToken(user._id.toHexString());

    res.header('x-auth', token).send(user);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.get('/me', authenticate, (req, res) => {
  // @ts-ignore
  res.send(req.user);
});

router.post('/login', async (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);

  console.log('logging in', body.email);

  try {
    const user = await findByCredentials(body.email, body.password);

    const token = await generateAndSaveAuthToken(user._id.toHexString());

    res.header('x-auth', token).send(user);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.delete('/me/token', authenticate, async (req: Request, res) => {
  const token = req.header('x-auth');

  if (!token) {
    return res.status(400).send();
  }

  try {
    // @ts-ignore
    await removeTokenFromUser(token, req.user._id.toHexString());
    res.status(200).send();
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

export default router;
