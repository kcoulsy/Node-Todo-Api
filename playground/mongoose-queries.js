const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {ObjectID} = require('mongodb');
const {User} = require('./../server/models/user');


var id = '5aa10d7a10552e6819b7440a';


if(!ObjectID.isValid(id)){
  console.log('User ID not valid');
} else {
  User.findById(id).then((user)=>{
    if(!user){
      return console.log('User not found');
    }
    console.log('User email:', user.email);
  }).catch((e) => {
    console.log(e);
  });

}
//
// Todo.find({
//   _id: id
// }).then((todos)=> {
//   console.log('1. Todos:', todos);
// });
//
// Todo.findOne({
//   _id: id
// }).then((todo)=> {
//   console.log('2. Todo:', todo);
// });
