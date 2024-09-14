import mongoose, { ConnectOptions } from 'mongoose';
import app from './app';

process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

const DB = process.env.DATABASE!.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD!,
);

const clientOptions: ConnectOptions = {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  },
};

mongoose
  .connect(DB, clientOptions)
  .then(() => console.log('Connection Successful'));

// START SERVER
const APP_PORT = process.env.PORT || 8080;
const server = app.listen(APP_PORT, () => {
  console.log(`Server is running on port ${APP_PORT}`);
});

process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => {});
  process.exit(1);
});
