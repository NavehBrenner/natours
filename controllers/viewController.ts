import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import { Tour } from '../models/toursModel';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { User } from '../models/userModel';
import AppError from '../utils/appError';
import { Booking } from '../models/bookingModel';

const getOverview = catchAsync(async (req: Request, res: Response) => {
  // get tour data from collection
  const tours = await Tour.find();

  // render template using tour data
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

const getTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
      path: 'reviews',
      select: 'rating review user',
    });

    if (!tour) return next(new AppError('Tour not found with that name', 404));

    res.status(200).render('tour', {
      title: `${tour!.name} tour`,
      tour,
    });
  },
);

const getLoginForm = (req: Request, res: Response) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

const getAccount = (req: Request, res: Response) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

const updateUserData = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(
    req.user?.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).render('account', {
    title: 'Your account',
    user,
  });
});

const getMyTours = async (req: Request, res: Response, next: NextFunction) => {
  // find all bookings
  const bookings = await Booking.find({ user: req.user!.id });

  // find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
};

export {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  updateUserData,
  getMyTours,
};
