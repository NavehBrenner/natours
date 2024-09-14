import { Schema, Document, Model, model } from 'mongoose';

interface IUser extends Document {
  name: string;
  email: string;
  photo: string;
  password: string;
  passwordConfirm: string;
}

const userSchema: Schema<IUser> = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    validate: {
      validator: (email: string) => {
        return true;
      },
      message: 'Invalid email',
    },
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    trim: true,
    validate: {
      validator: (password: string) => {
        return true;
      },
      message: 'Password must be at least 8 characters long',
    },
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    trim: true,
    validate: {
      validator: function (this: IUser, passwordConfirm: string) {
        return passwordConfirm === this.password;
      },
    },
  },
});
