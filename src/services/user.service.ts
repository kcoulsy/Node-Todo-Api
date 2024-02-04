import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../errors/Unauthorized';
import { NotFoundError } from '../errors/NotFound';

interface RegisterUser {
  email: string;
  password: string;
}

export async function registerUser({ email, password }: RegisterUser) {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    // TODO Better error
    throw new Error('User already exists');
  }

  const hashedPassword = await hashPassword(password);

  const user = new User({
    email,
    password: hashedPassword,
  });

  await user.save();

  return loginUser({ email, password });
}

interface LoginUser {
  email: string;
  password: string;
}

export async function loginUser({ email, password }: LoginUser) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new NotFoundError();
  }

  const isPasswordMatch = await comparePassword(password, user.password || '');

  if (!isPasswordMatch) {
    throw new UnauthorizedError();
  }

  await clearUserTokens({ userId: user._id.toHexString() });

  const token = await generateAuthToken(user._id.toHexString());

  user.tokens.push({ access: 'auth', token });

  return { user, token };
}

interface LogoutUser {
  userId: string;
}

export async function clearUserTokens({ userId }: LogoutUser) {
  const user = await findUserById(userId);

  if (!user) {
    throw new NotFoundError();
  }

  return user.updateOne({
    $pull: {
      tokens: { userId },
    },
  });
}

export async function findUserByEmail(email: string) {
  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new NotFoundError();
  }

  return user;
}

export async function findUserById(userId: string) {
  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError();
  }

  return user;
}

export async function findByToken(token: string) {
  const user = await User.findOne({
    'tokens.token': token,
  });

  if (!user) {
    throw new NotFoundError();
  }

  return user;
}

async function generateAuthToken(userId: string) {
  return jwt.sign({ _id: userId }, process.env.JWT_SECRET || 'secret');
}

async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
