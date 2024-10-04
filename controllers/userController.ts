import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import { User } from '../models/userModel';
import { deleteById, getAll, getById, updateById } from './handlerFactory';

const filterObj = (obj: Record<string, any>, ...fields: string[]) => {
  const filteredObj: Record<string, any> = {};
  fields.forEach((field) => {
    if (obj.hasOwnProperty(field)) {
      filteredObj[field] = obj[field];
    }
  });

  return filteredObj;
};

const getMe = (req: Request, res: Response, next: NextFunction) => {
  req.params.id = req.user?.id;
  next();
};

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

const getAllUsers = getAll(User);
const deleteUser = deleteById(User);
const updateUser = updateById(User);
const getUserById = getById(User);
export {
  getAllUsers,
  updateMe,
  deleteMe,
  deleteUser,
  updateUser,
  getUserById,
  getMe,
};
