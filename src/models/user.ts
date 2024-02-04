import { isEmail } from 'validator';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import bcrypt from 'bcryptjs';
import { mongoose } from '../db/mongoose';
import { InferSchemaType } from 'mongoose';

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

export type IUser = InferSchemaType<typeof UserSchema>;

function generateAuthToken(userId: string) {
  return jwt
    .sign({ _id: userId, access: 'auth' }, process.env.JWT_SECRET || 'secret')
    .toString();
}

export async function generateAndSaveAuthToken(userId: string) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  const token = generateAuthToken(user._id.toHexString());
  user.tokens.push({ access: 'auth', token });

  await user.save();

  return token;
}

export async function removeTokenFromUser(token: string, userId: string) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  return user.updateOne({
    $pull: {
      tokens: { token },
    },
  });
}

export async function findByToken(token: string) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
    _id: string;
  };

  if (!decoded || !decoded._id) {
    throw new Error('Invalid token');
  }

  return User.findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth',
  });
}

export async function findByCredentials(email: string, password: string) {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.password) {
    throw new Error('Invalid password');
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new Error('Invalid password');
  }

  return user.toObject({
    transform: (doc, ret) => {
      return _.pick(ret, ['_id', 'email']);
    },
  });
}

UserSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  next();
});

export const User = mongoose.model('Users', UserSchema);

export default User;
