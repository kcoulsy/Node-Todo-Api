import { IUser } from './models/user.model';

declare namespace Express {
  export interface Request {
    user?: IUser;
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}
