import express from 'express';
import {
  forgotPassword,
  login,
  protect,
  resetPassword,
  restrictTo,
  signUp,
  updatePassword,
} from '../controllers/authController';
import {
  deleteMe,
  deleteUser,
  getAllUsers,
  getMe,
  getUserById,
  updateMe,
  updateUser,
} from '../controllers/userController';

const userRouter = express.Router();

userRouter.post('/signup', signUp);
userRouter.post('/login', login);
userRouter.post('/forgotPassword', forgotPassword);
userRouter.patch('/resetPassword/:token', resetPassword);

userRouter.use(protect);

userRouter.patch('/updateMyPassword', updatePassword);
userRouter.patch('/updateMe', updateMe);
userRouter.get('/me', getMe, getUserById);
userRouter.delete('/deleteMe', deleteMe);

userRouter.use(restrictTo('admin'));

userRouter.route('/').get(getAllUsers);
userRouter.route('/:id').delete(deleteUser).patch(updateUser).get(getUserById);

export default userRouter;
