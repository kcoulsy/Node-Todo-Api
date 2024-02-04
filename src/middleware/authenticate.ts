import { NextFunction, Request, Response } from 'express';
import { findByToken } from '../models/user';

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.header('x-auth');

  if (!token) {
    return res.status(401).send(); //401 means that authentication is required
  }

  const user = await findByToken(token);

  if (!user) {
    return res.status(401).send(); //401 means that authentication is required
  }

  // @ts-ignore
  req.user = user;
  // @ts-ignore
  req.token = token;

  next();
}
