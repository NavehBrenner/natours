import fs from 'fs';
import mongoose, { ConnectOptions } from 'mongoose';
import dotenv from 'dotenv';
import Tour from '../../models/toursModel';
import { prependListener } from 'process';

dotenv.config({ path: './../../config.env' });

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

// read json file
const tours = JSON.parse(fs.readFileSync('tours-simple.json', 'utf-8'));

console.log(tours);

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('data loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// delete all data
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('delete completed');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') importData();

if (process.argv[2] === '--delete') deleteData();

console.log(process.argv);
