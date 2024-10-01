import { Schema, Document, Model, model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { NextFunction } from 'express';

interface IUser extends Document {
  name: string;
  email: string;
  photo: string;
  password: string;
  role: string;
  passwordConfirm: string | undefined;
  passwordChangedAt: number;
  passwordResetToken: string | undefined;
  passwordResetExpires: Date | undefined;
  active: boolean;
  correctPassword(candPass: string, userPass: string): Promise<boolean>;
  changedPasswordAfter(tokenTimestamp: number): boolean;
  createPasswordResetToken(): string;
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
    lowercase: true,
    validate: {
      validator: (email: string) => validator.isEmail(email),
      message: 'Invalid email',
    },
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    trim: true,
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    trim: true,
    validate: {
      validator: function (this: IUser, passwordConfirm: string) {
        return passwordConfirm === this.password;
      },
      message: 'Passwords do not match',
    },
  },
  passwordChangedAt: {
    type: Number,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,

  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre(/^find/, function (this: Model<IUser>, next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre('save', async function (next) {
  // only run fuction if password was modified
  if (!this.isModified('password')) return next();

  // encrypt password with cost 14
  this.password = await bcrypt.hash(this.password, 14);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.method(
  'correctPassword',
  async function (candidatePassword: string, userPassword: string) {
    return await bcrypt.compare(candidatePassword, userPassword);
  },
);

userSchema.method('changedPasswordAfter', function (JWTTimestamp: number) {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(this.passwordChangedAt / 1000);
    return JWTTimestamp < changedTimestamp;
  }

  return false;
});

userSchema.method('createPasswordResetToken', function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = (Date.now() + 10 * 60 * 1000) as unknown as Date;

  return resetToken;
});

const User: Model<IUser> = model('User', userSchema);

export { IUser, User };
