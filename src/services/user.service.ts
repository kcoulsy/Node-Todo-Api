import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../errors/Unauthorized';
import { NotFoundError } from '../errors/NotFound';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

  await prisma.user.create({
    data: {
      email: email,
      password: hashedPassword,
    },
  });

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

  const accessToken = await generateAccessToken(user.id);
  const refreshToken = await generateRefreshToken(user.id);

  return { user, accessToken, refreshToken };
}

interface LogoutUser {
  userId: string;
}

export async function clearUserRefreshToken({ userId }: LogoutUser) {
  const user = await findUserById(userId);

  if (!user) {
    throw new NotFoundError();
  }

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      refreshToken: null,
    },
  });
}

export async function setUserRefreshToken({
  userId,
  refreshToken,
}: {
  userId: string;
  refreshToken: string;
}) {
  const user = await findUserById(userId);

  if (!user) {
    throw new NotFoundError();
  }

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      refreshToken: refreshToken,
    },
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email: email,
    },
  });
}

export async function findUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new NotFoundError();
  }

  return user;
}

export async function generateAccessToken(userId: string) {
  return jwt.sign({ _id: userId }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '15 minutes',
  });
}

export async function generateRefreshToken(userId: string) {
  return jwt.sign({ _id: userId }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '7 days',
  });
}

export async function verifyToken(token: string) {
  const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');

  return {
    // @ts-ignore
    userId: payload._id,
  } as { userId: string };
}

async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
