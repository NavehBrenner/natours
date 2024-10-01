import { NextFunction, Request, Response } from 'express';
import { Review } from '../models/reviewModel';
import APIFeatures from '../utils/apiFeatures';
import catchAsync from '../utils/catchAsync';

const getAllReviews = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const reviews = await new APIFeatures(Review.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate().query;

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews,
      },
    });
  },
);

const postReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newReview = await Review.create(req.body);

    res.status(201).json({
      status: 'success',
      date: {
        review: newReview,
      },
    });
  },
);
const updateReview = (req: Request, res: Response, next: NextFunction) => {};
const deleteMyReview = (req: Request, res: Response, next: NextFunction) => {};
const deleteReviewById = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {};

export { getAllReviews, postReview, deleteMyReview, deleteReviewById };
