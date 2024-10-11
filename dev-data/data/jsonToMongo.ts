import fs from 'fs';
import mongoose, { ConnectOptions, Model } from 'mongoose';
import dotenv from 'dotenv';
import { Tour } from '../../models/toursModel';
import { User } from '../../models/userModel';
import { Review } from '../../models/reviewModel';
import { exit } from 'process';

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

// read json file
const tours = JSON.parse(fs.readFileSync('./tours.json', 'utf-8'));
const users = JSON.parse(fs.readFileSync('./users.json', 'utf-8'));
const reviews = JSON.parse(fs.readFileSync('./reviews.json', 'utf-8'));

const importData = async () => {
  try {
    await Tour.create(tours, { validateBeforeSave: false });
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews, { validateBeforeSave: false });
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
    await User.deleteMany();
    await Review.deleteMany();
    console.log('delete completed');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') importData();
else if (process.argv[2] === '--delete') deleteData();
else {
  console.log('please choose --import or --delete');
  exit(1);
}

console.log(process.argv);
