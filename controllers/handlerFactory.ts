import mongoose, { Model, PopulateOptions, Types } from 'mongoose';
import catchAsync from '../utils/catchAsync';
import { NextFunction, Request, Response } from 'express';
import AppError from '../utils/appError';
import APIFeatures from '../utils/apiFeatures';

const getById = <T>(model: Model<T>, populateOptions?: PopulateOptions) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let query = model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);

    const doc = await query;

    if (!doc) return next(new AppError('No document found with that id', 404));

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

const deleteById = <T>(model: Model<T>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await model.findByIdAndDelete(req.params.id);

    if (!doc) return next(new AppError('No document found with that id', 404));

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

const updateById = <T>(model: Model<T>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) return next(new AppError('No document found with that ID', 404));

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

const createOne = <T>(model: Model<T>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

const getAll = <T>(model: Model<T>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // to allow nested get reviews in tour;
    req.query.tour = req.params.tourId || req.query.tour;

    const features = new APIFeatures(model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        docs,
      },
    });
  });

export { getById, deleteById, updateById, createOne, getAll };
