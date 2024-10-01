import express, { Router } from 'express';
import { getAllReviews, postReview } from '../controllers/reviewController';
import { protect, restrictTo } from '../controllers/authController';

const reviewRouter = express.Router();

reviewRouter
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), postReview);

export default reviewRouter;
