import mongoose, {
  model,
  Model,
  ObjectId,
  Query,
  Schema,
  Document,
  Mongoose,
} from 'mongoose';
import { ITour, Tour } from './toursModel';
import { NextFunction } from 'express';

interface IReview extends Document {
  review: string;
  rating: number;
  createdAt: Date;
  tour: ObjectId;
  user: ObjectId;
  statics: { calcAverageRatings(tour: ITour): void };
}

// const calcAverageRatings = function (tour: ITour) {
//   return 0;
// };

const reviewSchema: Schema<IReview> = new Schema<IReview>(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  (this as Query<IReview, IReview>).populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId: ObjectId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0]?.nRating || 0,
    ratingsAverage: stats[0]?.avgRating || 4.5,
  });
};

reviewSchema.post('save', function () {
  // @ts-ignore
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  //@ts-ignore
  this.r = await Review.findOne(this.getQuery());
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  //@ts-ignore
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review: Model<IReview> = model('Review', reviewSchema);

export { IReview, Review };
