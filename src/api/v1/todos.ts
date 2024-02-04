import express from 'express';
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

const router = express.Router();

router.post('/', authenticate, async (req, res, next) => {
  try {
    const todo = await createTodo({
      text: req.body.text,
      isComplete: false,
      completedAt: null,
      // @ts-ignore
      userId: req.user._id.toString(),
    });

    res.send(todo);
  } catch (e) {
    next(e);
  }
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    // @ts-ignore
    const todos = await getTodosForUserId(req.user._id.toString());

    res.send({ todos });
  } catch (e) {
    next(e);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    var id = req.params.id;

    if (!isValidObjectId(id)) {
      throw new NotFoundError();
    }

    const todo = await getTodoById(id);

    // @ts-ignore
    if (todo?._creator?.toString() !== req.user._id.toString()) {
      throw new UnauthorizedError();
    }

    res.send({ todo });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    var id = req.params.id;

    if (!isValidObjectId(id)) {
      return res.status(404).send();
    }

    // @ts-ignore
    const todo = await deleteTodoById(id, req.user._id.toString());

    res.send({ todo });
  } catch (e) {
    next(e);
  }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'complete']);

    if (!isValidObjectId(id)) {
      return res.status(404).send();
    }

    // @ts-ignore
    const todo = await updateTodoById(id, req.user._id.toString(), {
      text: body.text,
      isComplete: body.complete,
    });

    res.send({ todo });
  } catch (e) {
    next(e);
  }
});

export default router;
