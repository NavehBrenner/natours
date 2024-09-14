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

const tourRouter = express.Router();

tourRouter.route('/').get(getAllTours).post(createTour);

tourRouter.route('/monthly-plan/:year').get(getMonthlyPlan);

tourRouter.route('/tour-stats').get(getTourStats);

tourRouter.route('/:id').get(getTourById).patch(updateTour).delete(deleteTour);

export default tourRouter;
