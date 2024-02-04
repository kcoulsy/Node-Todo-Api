import { NextFunction, Request, Response } from 'express';
import { NotFoundError } from '../errors/NotFound';
import { UnauthorizedError } from '../errors/Unauthorized';

export function errorHandlerMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof NotFoundError) {
    return res.status(err.statusCode).send({
      error: err.message,
    });
  }

  if (err instanceof UnauthorizedError) {
    return res.status(err.statusCode).send({
      error: err.message,
    });
  }

  console.error(err);
  res.status(500).send('Something broke!');
}
