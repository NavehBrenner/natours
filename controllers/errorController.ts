import { CastError, Error } from 'mongoose';
import AppError from '../utils/appError';
import { Request, Response, NextFunction } from 'express';

const handleJWTError = () =>
  new AppError('Invalid token. please login again', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again', 401);

const handleCastErrorDB = (err: CastError) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDb = (err: any) => {
  const message = `Duplicate field value: ${Object.entries(err.keyValue)
    .map((ent) => `(${ent.join(': ')})`)
    .join(',')}. Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: Error.ValidationError) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err: AppError, req: Request, res: Response) => {
  // api error
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode || 500).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // rendered site
  res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message,
  });
};

const sendErrorProd = (err: AppError, req: Request, res: Response) => {
  // log error in case its not operational for extended information on error
  if (!err.isOperational) console.log(err);

  // API ERROR
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational)
      return res.status(err.statusCode || 500).json({
        status: err.status || 'error',
        message: err.message || 'Something went wrong',
      });

    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }

  // RENDERED WEBSITE ERROR
  if (err.isOperational)
    return res.status(err.statusCode).render('error', {
      title: 'Somthing went wrong',
      msg: err.message,
    });

  res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'Please try again later',
  });
};

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (process.env.NODE_ENV === 'development') sendErrorDev(err, req, res);
  else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDb(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, req, res);
  }
};

export default globalErrorHandler;
