import express, { Request, Response } from 'express';
import {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  updateUserData,
} from '../controllers/viewController';
import { isLoggedIn, protect } from '../controllers/authController';

const viewRouter = express.Router();

viewRouter.get('/', isLoggedIn, getOverview);
viewRouter.get('/tour/:slug', isLoggedIn, getTour);
viewRouter.get('/login', isLoggedIn, getLoginForm);
viewRouter.get('/me', protect, getAccount);

// viewRouter.post('/submit-user-data', protect, updateUserData);

export default viewRouter;
