import { NotFoundError } from '../errors/NotFound';
import { UnauthorizedError } from '../errors/Unauthorized';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createTodo({
  text,
  isComplete = false,
  completedAt = null,
  userId,
}: {
  text: string;
  isComplete: boolean;
  completedAt: number | null;
  userId: string;
}) {
  return prisma.todo.create({
    data: {
      text,
      isComplete,
      completedAt: completedAt ? new Date(completedAt) : null,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export async function getTodosForUserId(userId: string) {
  const todo = await prisma.todo.findMany({
    where: {
      userId,
    },
  });

  if (!todo) {
    throw new NotFoundError();
  }

  return todo;
}

export async function getTodoById(id: string) {
  const todo = await prisma.todo.findUnique({
    where: {
      id,
    },
  });

  if (!todo) {
    throw new NotFoundError();
  }

  return todo;
}

export async function deleteTodoById(id: string, userId: string) {
  const todo = await getTodoById(id);

  if (!todo) {
    throw new NotFoundError();
  }

  if (todo?.userId !== userId) {
    throw new UnauthorizedError();
  }

  return prisma.todo.delete({
    where: {
      id,
    },
  });
}

export async function updateTodoById(
  id: string,
  userId: string,
  updates: { text: string; isComplete: boolean },
) {
  const todo = await getTodoById(id);

  if (!todo) {
    throw new NotFoundError();
  }

  if (todo?.userId !== userId) {
    throw new UnauthorizedError();
  }

  const completedAt = updates.isComplete ? new Date().getTime() : null;

  return prisma.todo.update({
    where: {
      id,
    },
    data: {
      text: updates.text,
      isComplete: updates.isComplete,
      completedAt: completedAt ? new Date(completedAt) : null,
    },
  });
}
