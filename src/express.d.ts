import { request, Request } from 'express';
import { IUser } from '../models/userModel';

declare global {
  namespace Express {
    interface Request {
      requestTime?: string;
      user?: IUser;
    }
  }
}
