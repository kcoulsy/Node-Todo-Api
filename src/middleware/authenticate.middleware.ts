import { NextFunction, Request, Response } from 'express';
import { findByToken } from '../services/user.service';

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.header('x-auth');

  if (!token) {
    return res.status(401).send({
      error: 'Missing x-auth header',
    });
  }

  try {
    const user = await findByToken(token);
    if (!user) {
      return res.status(401).send({
        error: 'Token invalid',
      });
    }

    // @ts-ignore
    req.user = user;
    // @ts-ignore
    req.token = token;

    next();
  } catch (e) {
    return res.status(401).send({
      error: 'Token invalid',
    });
  }
}
