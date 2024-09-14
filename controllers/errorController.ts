import { CastError, Error } from 'mongoose';
import AppError from '../utils/appError';
import { Request, Response, NextFunction } from 'express';

const handleCastErrorDB = (err: CastError) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDb = (err: any) => {
  err;
  const message = `Duplicate field value: ${err.keyValue.name}. Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: Error.ValidationError) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode || 500).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: AppError, res: Response) => {
  if (err.isOperational)
    res.status(err.statusCode || 500).json({
      status: err.status || 'error',
      message: err.message || 'Something went wrong',
    });
  else {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (process.env.NODE_ENV === 'development') sendErrorDev(err, res);
  else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDb(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    sendErrorProd(error, res);
  }
};

export default globalErrorHandler;
