/* eslint-disable consistent-return */
import {
  Document, Schema, Model, model, Error,
} from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  username: string;
  password: string;
  email: string;
}

export const userSchema: Schema<IUser> = new Schema<IUser>({
  username: String,
  password: String,
  email: String,
});

userSchema.pre<IUser>('save', function save(next) {
  const user = this;
  const hash = bcrypt.hash(this.password, 10);
  this.password = hash;
  next();
});

userSchema.methods.comparePassword = function (candidatePassword: string, callback: any) {
  bcrypt.compare(candidatePassword, this.password, (err: Error, isMatch: boolean) => {
    callback(err, isMatch);
  });
};

export const User: Model<IUser> = model<IUser>('User', userSchema);
