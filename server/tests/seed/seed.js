const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');


const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
  _id: userOneId,
  email: 'one@example.com',
  password: 'useronePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc').toString()
  }]
},
{
  _id: userTwoId,
  email: 'two@example.com',
  password: 'usertwoPass'
}];

const todos = [
  {
    _id: new ObjectID(),
    text: 'First test todo'
  },
  {
    _id: new ObjectID(),
    text: 'Second test todo',
    complete: true,
    completedAt: 333
  }
];

const populateTodos = (done)=> {
  Todo.remove({}).then(()=>{
    return Todo.insertMany(todos);

  }).then(() => done());

};

const populateUsers = (done) =>{
  User.remove({}).then(()=>{
    //can't use insertMany as it doesn't use the middleware to hash the password. so we will use User().save();
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo]); //using return to add .then after
  }).then(() => done());
};

module.exports = {
  users,
  todos,
  populateTodos,
  populateUsers
};
