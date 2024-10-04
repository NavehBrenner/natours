// import fs from 'fs';
// import path from 'node:path';
// import { fileURLToPath } from 'node:url';
import e, { Response, Request, NextFunction } from 'express';
import { ITour, Tour } from '../models/toursModel';
import catchAsync from '../utils/catchAsync';
import {
  createOne,
  deleteById,
  getAll,
  getById,
  updateById,
} from './handlerFactory';
import AppError from '../utils/appError';
import { QueryOptions, RootFilterQuery } from 'mongoose';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

const getAllTours = getAll(Tour);
const getTourById = getById(Tour, { path: 'reviews' });
const createTour = createOne(Tour);
const updateTour = updateById(Tour);
const deleteTour = deleteById(Tour);

const getTourStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          results: { $sum: 1 },
          numRating: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  },
);

const getMonthlyPlan = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const year = +req.params.year;

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTours: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: {
          month: '$_id',
        },
      },
      {
        $sort: {
          numTours: -1,
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $limit: 12,
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: plan,
    });
  },
);

const getToursWithin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = +distance / (unit === 'mi' ? 3963.2 : 6378.1);
    if (!lat || !lng)
      next(
        new AppError(
          'Please provide latitude AND longitude in the format: lat,lng',
          400,
        ),
      );

    const tours = await Tour.find({
      startLocation: {
        $geoWithin: { $centerSphere: [[lng, lat], radius] },
      },
    });

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  },
);

const getDistances = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = 0.001 * (unit === 'mi' ? 0.621 : 1);

    if (!lat || !lng)
      next(
        new AppError(
          'Please provide latitude AND longitude in the format: lat,lng',
          400,
        ),
      );

    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [+lng, +lat] },
          distanceField: 'distance',
          distanceMultiplier: multiplier,
        },
      },
      {
        $project: {
          distance: 1,
          name: 1,
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        data: distances,
      },
    });
  },
);

export {
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
};
