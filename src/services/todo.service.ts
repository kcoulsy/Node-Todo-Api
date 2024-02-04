import { NotFoundError } from '../errors/NotFound';
import { UnauthorizedError } from '../errors/Unauthorized';
import { Todo } from '../models/todo.model';

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
  const todo = new Todo({
    text,
    complete: isComplete,
    completedAt,
    _creator: userId,
  });

  return todo.save();
}

export async function getTodosForUserId(userId: string) {
  const todo = await Todo.find({ _creator: userId });

  if (!todo) {
    throw new NotFoundError();
  }

  return todo;
}

export async function getTodoById(id: string) {
  const todo = await Todo.findOne({ _id: id });

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

  console.log(todo?._creator?.toString(), userId);
  if (todo?._creator?.toString() !== userId) {
    throw new UnauthorizedError();
  }

  return Todo.findOneAndDelete({ _id: id });
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

  if (todo?._creator?.toString() !== userId) {
    throw new UnauthorizedError();
  }

  const completedAt = updates.isComplete ? new Date().getTime() : null;

  return Todo.findOneAndUpdate(
    { _id: id },
    { $set: { text: updates.text, complete: updates.isComplete, completedAt } },
    { new: true },
  );
}
