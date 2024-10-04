import express, { Router } from 'express';
import {
  deleteReviewById,
  getAllReviews,
  getReviewById,
  postReview,
  setTourUserId,
  updateReviewById,
} from '../controllers/reviewController';
import { protect, restrictTo } from '../controllers/authController';

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.use(protect);

reviewRouter
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), setTourUserId, postReview);

reviewRouter
  .route('/:id')
  .patch(restrictTo('user', 'admin'), updateReviewById)
  .get(getReviewById)
  .delete(protect, restrictTo('user', 'admin'), deleteReviewById);

export default reviewRouter;
