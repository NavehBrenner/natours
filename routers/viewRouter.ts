import express, { Request, Response } from 'express';
import {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  getMyTours,
} from '../controllers/viewController';
import { isLoggedIn, protect } from '../controllers/authController';
import { createBookingCheckout } from '../controllers/bookingController';

const viewRouter = express.Router();

viewRouter.get('/', createBookingCheckout, isLoggedIn, getOverview);
viewRouter.get('/tour/:slug', isLoggedIn, getTour);
viewRouter.get('/login', isLoggedIn, getLoginForm);
viewRouter.get('/me', protect, getAccount);
viewRouter.get('/myTours', protect, getMyTours);

// viewRouter.post('/submit-user-data', protect, updateUserData);

export default viewRouter;
