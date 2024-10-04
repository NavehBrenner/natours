import express from 'express';
import {
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
} from '../controllers/tourController';
import { protect, restrictTo } from '../controllers/authController';
import { getAllReviews, postReview } from '../controllers/reviewController';
import reviewRouter from './reviewRouter';

const tourRouter = express.Router();

tourRouter.use('/:tourId/reviews', reviewRouter);

tourRouter
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);
tourRouter.route('/tour-stats').get(getTourStats);

tourRouter
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);

tourRouter.route('/distances/:latlng/unit/:unit').get(getDistances);

tourRouter
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);

tourRouter
  .route('/:id')
  .get(getTourById)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour);

export default tourRouter;
