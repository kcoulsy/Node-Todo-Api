var express = require('express');
var bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req,res) => {
  var todo = new Todo({
    text: req.body.text
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  })
});

app.get('/todos', (req, res) => {
  Todo.find().then((todos)=>{
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos/:id', (req,res) => {
  var id = req.params.id;

  if(!ObjectID.isValid(id)){
    return res.sendStatus(404);
  } else {
    Todo.findById(id).then((todo)=>{
      if(!todo){
        res.sendStatus(404);
      }
      res.send({todo});
    }).catch((e) => {
      res.status(400).send();
    });
  }
});

app.delete('/todos/:id', (req, res) => {
  // get the id
  var id = req.params.id;

  //validate the id or return 404
  if(!ObjectID.isValid(id)){
    return res.sendStatus(404);
  }
  Todo.findByIdAndRemove(id).then((todo) => {
    if(!todo) {
      return res.sendStatus(404);
    }
    return res.send(todo);
  }).catch((e) => {
    return res.status(400).send();
  })
  //remove todobyid
    //success
      //if no doc -> 404
      //if doc then send back with 200
    //error
      //400 with empty body
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
})


module.exports = {app};
