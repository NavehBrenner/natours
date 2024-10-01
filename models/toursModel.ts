import { NextFunction } from 'express';
import mongoose, { Document, model, Model, Query, Schema } from 'mongoose';
import { ObjectId } from 'mongoose';
import slugify from 'slugify';
import { IUser, User } from './userModel';

interface ILocation {
  type: 'Point'; // Fixed value as per your enum
  coordinates: [number, number]; // Typically [longitude, latitude]
  address: string; // Address as a string
  description?: string; // Optional description
}

interface ITour extends Document {
  slug: string;
  name: string;
  price: number;
  ratingAverage: number;
  duration: number;
  maxGroupSize: number;
  difficulty: string;
  ratingsAverage: number;
  ratingsQuantity: number;
  priceDiscount: number;
  summary: string;
  description: string;
  imageCover: string;
  images: string[];
  startDates: Date[];
  createdAt: Date;
  startLocation: ILocation;
  locations: ILocation[];
  guides: ObjectId[];
}

const tourSchema: Schema<ITour> = new Schema<ITour>(
  {
    slug: String,
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must be between 10 and 40 characters'],
      minlength: [10, 'A tour name must be between 10 and 40 characters'],
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty must be easy/medium/difficult',
      },
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1.0, 'rating must be between 1.0 and 5.0'],
      max: [5.0, 'rating must be between 1.0 and 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (this: ITour, val: number) {
          return this.priceDiscount > val;
        },
        message: 'Tour discount can be more than tour price',
      },
    },
    summary: {
      type: String,
      required: [true, 'A tour must have a description'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },

    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    startLocation: {
      type: { type: String, default: 'Point', enum: ['Point'] },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: { type: String, default: 'Point', enum: ['Point'] },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre(/^find/, async function (next) {
  (this as Query<ITour, ITour>).populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

// ENBEDDING GUIDES TO TOUR
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => User.findById(id));
//   this.guides = (await Promise.all(guidesPromises)).filter(
//     (guide) => guide != null,
//   );
//   next();
// });

const Tour: Model<ITour> = model('Tour', tourSchema);

export { Tour, ITour };
