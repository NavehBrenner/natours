import express from 'express';
import {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userHandlers.mjs';

const userRouter = express.Router();

userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('./:id').get(getUserById, updateUser, deleteUser);

export default userRouter;
