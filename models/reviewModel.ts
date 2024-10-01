import { model, Model, ObjectId, Query, Schema } from 'mongoose';

interface IReview extends Document {
  review: string;
  rating: number;
  createdAt: Date;
  tour: ObjectId;
  user: ObjectId;
}

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

reviewSchema.pre(/^find/, function (next) {
  (this as Query<IReview, IReview>).populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

const Review: Model<IReview> = model('Review', reviewSchema);

export { IReview, Review };
