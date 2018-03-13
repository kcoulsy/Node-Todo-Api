require('./config/config.js');

const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

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
    return res.status(404).send();
  }
  Todo.findByIdAndRemove(id).then((todo) => {
    if(!todo) {
      return res.status(404).send();
    }
    return res.send({todo: todo});
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

app.patch('/todos/:id', (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text','complete']);

  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  }

  if(_.isBoolean(body.complete) && body.complete){
    body.completedAt = new Date().getTime();
  } else {
    body.completedAt = null;
    body.complete = false
  }

  Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
    if(!todo){
      return res.status(404).send();
    }
    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });
});

//POST /Users
app.post('/Users', (req,res) => {
  var body = _.pick(req.body, ['email','password']);
  var user = new User(body);

  user.save().then(() => {
    //instead of res.send(user) we return the
    return user.generateAuthToken();
    //call the generateAuthToken method which puts a token into the database, then returns it
    //so we can use a .then() using the token variable
  }).then((token) => {

    //res.send(user);

    //using the token returned above, we can put it in the header so it can be used later.
    res.header('x-auth', token).send(user);

    //then catch any errors which may occur, such as incorrect data (invalid email/pass etc)
  }).catch((e) => {
    res.status(400).send(e);
  })
});

// app.get('/users/me', (req, res) => {
//  var token = req.header('x-auth');
//  User.findByToken(token).then((user)=>{ //user is returned from the method, so then we can .then() and check if it returned it
// if(!user) {
//  throw an error
// }
// res.send(user);
// });
// });
//
//using middleware the below is the same but more elegant
//the above functionality is put into its own file and called at the top of the doc. this allows us to use it in other places too

app.get ('/users/me', authenticate, (req, res)=>{
  res.send(req.user);

});


//POST /users/login {email, password}
app.post('/users/login', (req,res) => {
  var body = _.pick(req.body, ['email','password']);

  //verify user exists with email and password
  User.findByCredentials(body.email, body.password).then((user) =>{
    //exactly same as above
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((e)=>{
    res.status(400).send();
  });
  //then compare hashed password
  //res.send(body);
});


app.listen(port, () => {
  console.log(`Started on port ${port}`);
})


module.exports = {app};
