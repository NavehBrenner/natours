import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { IUser, User } from '../models/userModel';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { sendEmail, Email } from '../utils/email';
import crypto from 'crypto';

const signToken = (id: any) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const sendLoginToken = (res: Response, user: IUser, statusCode: number) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + +process.env.JWT_COOKIE_EXPIRES! * 60 * 1000,
    ),
    secure: process.env.NODE_ENV === 'production' ? true : false,
    httpOnly: true,
  };

  res.cookie('jwt', token, cookieOptions);
  // @ts-ignore
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

const signUp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role,
    });

    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser, url).sendWelcome();
    sendLoginToken(res, newUser, 201);
  },
);

const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password)
      return next(new AppError('Please provide email and password', 400));

    // find user in DB
    const user = await User.findOne({
      email,
    }).select('+password');

    // USER DOES NOT EXIST OR INVALID PASSWORD
    if (
      !user ||
      !(await user.correctPassword(req.body.password, user.password))
    )
      return next(new AppError('Incorrect email or password', 401));

    sendLoginToken(res, user, 200);
  },
);

const logout = (req: Request, res: Response) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};

const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;
    // Get token and check if it's there
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) token = req.cookies.jwt;

    if (!token)
      return next(
        new AppError('You are not logged in! Please log in to get access', 401),
      );

    // Verification token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    // Check if user still exists
    const currentUser = await User.findById((decoded as any).id);

    if (!currentUser) return next(new AppError('User no longer exists'));

    // Check if user changed password after jwt was issued
    if (
      currentUser.changedPasswordAfter((decoded as JwtPayload).iat as number)
    ) {
      return next(
        new AppError(
          'User recently changed password! Please log in again.',
          401,
        ),
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    res.locals.user = currentUser;
    req.user = currentUser;
    next();
  },
);

const isLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // check for token
    if (!req.cookies.jwt) return next();

    // verify token
    const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET!);

    // find user
    const currentUser = await User.findById((decoded as any).id);

    // check user exists and hasnt changed password
    if (!currentUser) return next();
    if (currentUser.changedPasswordAfter((decoded as JwtPayload).iat as number))
      return next();

    // there is logged in
    res.locals.user = currentUser;
    next();
  } catch (err) {
    next();
  }
};

const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role!)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }

    next();
  };
};

const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // get user based on email
    const user = await User.findOne({ email: req.body.email });

    if (!user)
      return next(
        new AppError('There is no user with that email address', 404),
      );

    // generate random token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    // send token as email

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    try {
      await new Email(user, resetURL).sendPasswordReset();
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError(
          'There was an error sending the email. Please try again later!',
          500,
        ),
      );
    }

    res.status(200).json({
      status: 'success',
      message: 'Your password reset token is sent to your email',
    });
  },
);

const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // get user based on token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // if token has not expired, and there is user, set new password
    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }

    // update changedPasswordAt property for user
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // login user
    sendLoginToken(res, user, 200);
  },
);

const updatePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // get user from collection
    const user = await User.findById(req.user?._id).select('+password');

    // user was deleted
    if (!user)
      return next(new AppError('This user does no longer exists', 404));

    const authenticated = await user.correctPassword(
      req.body.passwordCurrent || '',
      user.password,
    );
    // check if POSTed password is correct
    if (!authenticated)
      return next(new AppError('Your current password is not correct.', 401));

    // if password is correct update password
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPasswordConfirm;

    await user.save();

    // login user
    sendLoginToken(res, user, 200);
  },
);

export {
  signUp,
  login,
  logout,
  protect,
  isLoggedIn,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
};
