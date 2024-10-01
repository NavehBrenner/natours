import express from 'express';
import {
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  getTourStats,
  getMonthlyPlan,
} from '../controllers/tourController';
import { protect, restrictTo } from '../controllers/authController';
import { postReview } from '../controllers/reviewController';

const tourRouter = express.Router();

tourRouter.route('/monthly-plan/:year').get(getMonthlyPlan);
tourRouter.route('/tour-stats').get(getTourStats);

tourRouter.route('/').get(protect, getAllTours).post(createTour);

tourRouter
  .route('/:id')
  .get(protect, getTourById)
  .patch(updateTour)
  .delete(restrictTo('admin', 'lead-guide'), deleteTour);

tourRouter.route('/:id/reviews').post(protect, restrictTo('user'), postReview);

export default tourRouter;
