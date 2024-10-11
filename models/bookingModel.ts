import { Document, model, ObjectId, Query, Schema } from 'mongoose';

interface IBooking extends Document {
  tour: ObjectId;
  user: ObjectId;
  price: number;
  createdAt: Date;
  paid: boolean;
}

const bookingSchema: Schema<IBooking> = new Schema<IBooking>({
  tour: {
    type: Schema.Types.ObjectId,
    ref: 'Tour',
    required: [true, 'Bookings must belong to a tour'],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Bookings must belong to a user'],
  },
  price: {
    type: Number,
    required: [true, 'Bookings must have a price'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

bookingSchema.pre(/^find/, function (next) {
  (this as Query<IBooking, IBooking>)
    .populate('user')
    .populate({ path: 'tour', select: 'name' });

  next();
});

const Booking = model<IBooking>('Booking', bookingSchema);

export { Booking, IBooking };
