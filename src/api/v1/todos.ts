import Router from 'express-promise-router';
import { authenticate } from '../../middleware/authenticate.middleware';
import _ from 'lodash';
import { isValidObjectId } from 'mongoose';
import {
  createTodo,
  deleteTodoById,
  getTodoById,
  getTodosForUserId,
  updateTodoById,
} from '../../services/todo.service';
import { UnauthorizedError } from '../../errors/Unauthorized';
import { NotFoundError } from '../../errors/NotFound';

const router = Router();

router.post('/', authenticate, async (req, res) => {
  const todo = await createTodo({
    text: req.body.text,
    isComplete: false,
    completedAt: null,
    userId: req.userId || '',
  });

  res.send(todo);
});

router.get('/', authenticate, async (req, res) => {
  const todos = await getTodosForUserId(req.userId || '');

  res.send({ todos });
});

router.get('/:id', authenticate, async (req, res) => {
  var id = req.params.id;

  if (!isValidObjectId(id)) {
    throw new NotFoundError();
  }

  const todo = await getTodoById(id);

  if (todo?.userId !== req.userId) {
    throw new UnauthorizedError();
  }

  res.send({ todo });
});

router.delete('/:id', authenticate, async (req, res) => {
  var id = req.params.id;

  if (!isValidObjectId(id)) {
    return res.status(404).send();
  }

  const todo = await deleteTodoById(id, req.userId || '');

  res.send({ todo });
});

router.put('/:id', authenticate, async (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'complete']);

  if (!isValidObjectId(id)) {
    return res.status(404).send();
  }

  const todo = await updateTodoById(id, req.userId || '', {
    text: body.text,
    isComplete: body.complete,
  });

  res.send({ todo });
});

export default router;
