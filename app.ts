import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import { configDotenv } from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet, { xssFilter, xXssProtection } from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import tourRouter from './routers/tourRouter';
import AppError from './utils/appError';
import globalErrorHandler from './controllers/errorController';
import userRouter from './routers/userRouter';
// @ts-ignore
import { xss } from 'express-xss-sanitizer';
import reviewRouter from './routers/reviewRouter';

configDotenv({ path: './config.env' });

const app = express();

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(
  express.json({
    limit: '10kb',
  }),
);

// Data sanitization against NoSQL query injections
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());
app.use(xXssProtection());
app.use(xssFilter());
// Prevent parameter polution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

app.use((req: Request, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2) ROUTING
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
