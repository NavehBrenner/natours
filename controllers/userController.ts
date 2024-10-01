import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import { User } from '../models/userModel';

const filterObj = (obj: Record<string, any>, ...fields: string[]) => {
  const filteredObj: Record<string, any> = {};
  fields.forEach((field) => {
    if (obj.hasOwnProperty(field)) {
      filteredObj[field] = obj[field];
    }
  });

  return filteredObj;
};

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find();

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  },
);

const updateMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new Error(
          'This route is not for password updates. Please use /updateMyPassword',
        ),
      );
    }

    const filteredBody = filterObj(req.body, 'name', 'email');

    const updatedUser = await User.findByIdAndUpdate(
      req.user?.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  },
);

const deleteMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await User.findByIdAndUpdate(req.user?.id, { active: false });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  },
);

export { getAllUsers, updateMe, deleteMe };
