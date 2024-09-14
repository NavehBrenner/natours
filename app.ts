import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import { configDotenv } from 'dotenv';
import tourRouter from './routers/tourRouter';
import AppError from './utils/appError';
import globalErrorHandler from './controllers/errorController';

configDotenv({ path: './config.env' });

const app = express();

// 1) MIDDLEWARES
app.use(express.json());

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// 2) ROUTING
app.use('/api/v1/tours', tourRouter);
// app.use('/api/v1/users', userRouter);

app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
