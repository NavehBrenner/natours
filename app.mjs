import express from 'express';
import morgan from 'morgan';
import { configDotenv } from 'dotenv';
import tourRouter from './routers/tourRouter.mjs';
import userRouter from './routers/userRouter.mjs';

configDotenv({ path: './config.env' });

const app = express();

// 1) MIDDLEWARES
app.use(express.json());

// console.log(process.env);

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// 2) ROUTING
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

export default app;
