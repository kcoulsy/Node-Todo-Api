import { IUser } from './models/user';

declare namespace Express {
  export interface Request {
    user?: IUser;
  }
}
