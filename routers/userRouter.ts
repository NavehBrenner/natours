import express from 'express';
import {
  forgotPassword,
  login,
  protect,
  resetPassword,
  signUp,
  updatePassword,
} from '../controllers/authController';
import { deleteMe, getAllUsers, updateMe } from '../controllers/userController';

const userRouter = express.Router();

userRouter.post('/signup', signUp);
userRouter.post('/login', login);

userRouter.post('/forgotPassword', forgotPassword);
userRouter.patch('/resetPassword/:token', resetPassword);
userRouter.patch('/updateMyPassword', protect, updatePassword);
userRouter.patch('/updateMe', protect, updateMe);
userRouter.delete('/deleteMe', protect, deleteMe);

userRouter.route('/').get(getAllUsers);

export default userRouter;
