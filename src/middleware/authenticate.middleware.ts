import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../services/user.service';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).send({
      error: 'Missing Authorization header',
    });
  }

  try {
    const { userId } = await verifyToken(token);

    req.userId = userId;

    next();
  } catch (e) {
    return res.status(401).send({
      error: 'Token invalid',
    });
  }
}
