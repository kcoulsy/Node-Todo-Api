import express from 'express';
import { authenticate } from '../middleware/authenticate';
import { Todo } from '../models/todo';
import _ from 'lodash';
import { isValidObjectId } from 'mongoose';

const router = express.Router();

router.post('/', authenticate, async (req, res) => {
  var todo = new Todo({
    text: req.body.text,
    // @ts-ignore
    _creator: req.user._id,
  });

  try {
    const doc = await todo.save();
    res.send(doc);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const todos = await Todo.find({
      // @ts-ignore
      _creator: req.user._id,
    });

    res.send({ todos });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/:id', authenticate, async (req, res) => {
  var id = req.params.id;

  if (!isValidObjectId(id)) {
    return res.sendStatus(404);
  }
  try {
    const todo = await Todo.findOne({
      _id: id,
      // @ts-ignore
      _creator: req.user._id,
    });

    if (!todo) {
      res.sendStatus(404);
    }
    res.send({ todo });
  } catch (e) {
    res.status(400).send();
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  // get the id
  var id = req.params.id;

  //validate the id or return 404
  if (!isValidObjectId(id)) {
    return res.status(404).send();
  }

  try {
    const todo = await Todo.findOneAndDelete({
      _id: id,
      // @ts-ignore
      _creator: req.user._id,
    });

    if (!todo) {
      return res.status(404).send();
    }

    res.send({ todo });
  } catch (e) {
    res.status(400).send();
  }
});

router.patch('/:id', authenticate, async (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'complete']);

  if (!isValidObjectId(id)) {
    return res.status(404).send();
  }

  const completedAt =
    _.isBoolean(body.complete) && body.complete ? new Date().getTime() : null;

  try {
    const todo = await Todo.findOneAndUpdate(
      {
        _id: id,
        // @ts-ignore
        _creator: req.user._id,
      },
      {
        $set: {
          text: body.text,
          complete: body.complete,
          completedAt,
        },
      },
      { new: true },
    );

    if (!todo) {
      return res.status(404).send();
    }

    res.send({ todo });
  } catch (e) {
    res.status(400).send();
  }
});

export default router;
