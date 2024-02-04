import { isEmail } from 'validator';
import _ from 'lodash';
import mongoose from '../db/mongoose';

const UserSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: (value: string) => isEmail(value),
      message: '{VALUE} is not a valid email!',
    },
  },
  password: {
    type: String,
    require: true,
    minlength: 6,
  },
  tokens: [
    {
      access: {
        type: String,
        require: true,
      },
      token: {
        type: String,
        require: true,
      },
    },
  ],
});

export const User = mongoose.model('Users', UserSchema);
