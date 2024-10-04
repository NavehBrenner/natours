import fs from 'fs';
import mongoose, { ConnectOptions, Model } from 'mongoose';
import dotenv from 'dotenv';
import { Tour } from '../../models/toursModel';
import { User } from '../../models/userModel';
import { Review } from '../../models/reviewModel';

dotenv.config({
  path: 'C:/Users/naven/Desktop/complete-node-bootcamp-master/4-natours/starter/config.env',
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

const path: string = './reviews.json';
// read json file
const docs = JSON.parse(fs.readFileSync(path, 'utf-8'));
console.log(docs);

const importData = async <T>(model: Model<T>) => {
  try {
    await model.create(docs, { validateBeforeSave: false });
    console.log('data loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// delete all data
const deleteData = async <T>(model: Model<T>) => {
  try {
    await model.deleteMany();
    console.log('delete completed');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') importData(Review);

if (process.argv[2] === '--delete') deleteData(Review);

console.log(process.argv);
