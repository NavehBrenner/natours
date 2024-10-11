import express from 'express';
import { protect, restrictTo } from '../controllers/authController';
import {
  createBooking,
  deleteBookingById,
  getAllBookings,
  getBookingById,
  getCheckoutSession,
  updateBookingById,
} from '../controllers/bookingController';

const bookingRouter = express.Router();

bookingRouter.use(protect);

bookingRouter.get('/checkout-session/:tourId', getCheckoutSession);

bookingRouter.use(restrictTo('admin', 'lead-guide'));

bookingRouter.route('/').get(getAllBookings).post(createBooking);

bookingRouter
  .route('/:id')
  .get(getBookingById)
  .patch(updateBookingById)
  .delete(deleteBookingById);

export default bookingRouter;
