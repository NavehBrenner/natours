import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import { User } from '../models/userModel';
import { deleteById, getAll, getById, updateById } from './handlerFactory';
import multer, { FileFilterCallback } from 'multer';
import AppError from '../utils/appError';
import sharp from 'sharp';

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     //user-<USERID>-<TIMESTAMP>.jpeg
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user?.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppError('Not am image! please only uploda images', 400));
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const uploadUserPhoto = upload.single('photo');

const resizeUserPhoto = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user?.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

const filterObj = (obj: Record<string, any>, ...fields: string[]) => {
  const filteredObj: Record<string, any> = {};
  fields.forEach((field) => {
    if (obj[field]) {
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
    if (req.file) filteredBody.photo = req.file.filename;

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
  resizeUserPhoto,
  getAllUsers,
  updateMe,
  deleteMe,
  deleteUser,
  updateUser,
  getUserById,
  getMe,
  uploadUserPhoto,
};
