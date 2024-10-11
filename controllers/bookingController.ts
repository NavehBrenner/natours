import { Request, Response } from 'express';
import { NextFunction } from 'express-serve-static-core';
import catchAsync from '../utils/catchAsync';
import { Tour } from '../models/toursModel';
import AppError from '../utils/appError';
import Stripe from 'stripe';
import { configDotenv } from 'dotenv';
import { Booking } from '../models/bookingModel';
import {
  createOne,
  deleteById,
  getAll,
  getById,
  updateById,
} from './handlerFactory';

configDotenv({
  path: 'C:/Users/naven/Desktop/complete-node-bootcamp-master/4-natours/starter/config.env',
});

const stripe = new Stripe(process.env.STRIPE_TEST_KEY!);

const getCheckoutSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tour = await Tour.findById(req.params.tourId);

    if (!tour) return next(new AppError('No tour found with that ID', 404));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user?.id}&price=${tour.price}`,
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
      customer_email: req.user?.email,
      client_reference_id: req.params.tourId,
      currency: 'usd',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: tour.price * 100,
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,
              images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
            },
          },
          quantity: 1,
        },
      ],
    });

    res.status(200).json({
      status: 'success',
      session,
    });
  },
);

const createBookingCheckout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // temporary NOT SECURE SOLUTION - users may creating bookings without paying
    const { tour, user, price } = req.query;
    if (!tour || !user || !price) return next();

    await Booking.create({
      tour,
      user,
      price,
    });

    res.redirect(req.originalUrl.split('?')[0]);
  },
);

const createBooking = createOne(Booking);
const deleteBookingById = deleteById(Booking);
const updateBookingById = updateById(Booking);
const getBookingById = getById(Booking);
const getAllBookings = getAll(Booking);

export {
  getCheckoutSession,
  createBookingCheckout,
  createBooking,
  deleteBookingById,
  updateBookingById,
  getBookingById,
  getAllBookings,
};
