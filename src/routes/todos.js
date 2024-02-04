const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const { Todo } = require("../models/todo");
const _ = require("lodash");

const router = express.Router();

router.post("/", authenticate, (req, res) => {
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id,
  });

  todo.save().then(
    (doc) => {
      res.send(doc);
    },
    (e) => {
      res.status(400).send(e);
    }
  );
});

router.get("/", authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id,
  }).then(
    (todos) => {
      res.send({ todos });
    },
    (e) => {
      res.status(400).send(e);
    }
  );
});

router.get("/:id", authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.sendStatus(404);
  } else {
    Todo.findOne({
      _id: id,
      _creator: req.user._id,
    })
      .then((todo) => {
        if (!todo) {
          res.sendStatus(404);
        }
        res.send({ todo });
      })
      .catch((e) => {
        res.status(400).send();
      });
  }
});

router.delete("/:id", authenticate, (req, res) => {
  // get the id
  var id = req.params.id;

  //validate the id or return 404
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id,
  })
    .then((todo) => {
      if (!todo) {
        return res.status(404).send();
      }
      return res.send({ todo: todo });
    })
    .catch((e) => {
      return res.status(400).send();
    });
  //remove todobyid
  //success
  //if no doc -> 404
  //if doc then send back with 200
  //error
  //400 with empty body
});

router.patch("/:id", authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ["text", "complete"]);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.complete) && body.complete) {
    body.completedAt = new Date().getTime();
  } else {
    body.completedAt = null;
    body.complete = false;
  }

  Todo.findOneAndUpdate(
    {
      _id: id,
      _creator: req.user._id,
    },
    { $set: body },
    { new: true }
  )
    .then((todo) => {
      if (!todo) {
        return res.status(404).send();
      }
      res.send({ todo });
    })
    .catch((e) => {
      res.status(400).send();
    });
});

module.exports = router;
