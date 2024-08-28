import express from 'express';
import {
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  checkID,
  checkTourBody,
} from '../controllers/tourHandlers.mjs';

const tourRouter = express.Router();

tourRouter.param('id', checkID);

tourRouter.route('/').get(getAllTours).post(checkTourBody, createTour);

tourRouter.route('/:id').get(getTourById).patch(updateTour).delete(deleteTour);

export default tourRouter;
