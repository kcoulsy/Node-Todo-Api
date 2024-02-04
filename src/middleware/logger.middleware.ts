import { NextFunction, Request, Response } from 'express';

export default function loggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const time = new Date();

  console.log(`[${time.toISOString()}] ${req.method} ${req.url} [${req.ip}]`);

  next();
}
