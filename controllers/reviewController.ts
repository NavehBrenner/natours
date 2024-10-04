import { NextFunction, Request, Response } from 'express';
import { Review } from '../models/reviewModel';
import {
  createOne,
  deleteById,
  getAll,
  getById,
  updateById,
} from './handlerFactory';

const setTourUserId = (req: Request, res: Response, next: NextFunction) => {
  req.body.tour = req.params.tourId || req.body.tour;
  req.body.user = req.user?.id || req.body.user;
  next();
};

const getAllReviews = getAll(Review);
const postReview = createOne(Review);
const deleteReviewById = deleteById(Review);
const updateReviewById = updateById(Review);
const getReviewById = getById(Review);

export {
  getAllReviews,
  postReview,
  deleteReviewById,
  updateReviewById,
  setTourUserId,
  getReviewById,
};
