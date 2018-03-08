const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');


// Todo.remove({}) removes all

// Todo.remove({}).then((res) => {
//   console.log(res);
// });
//
// //find one and remove but also returns the data
// Todo.findOneAndRemove();


//finds by the id and returns back
Todo.findByIdAndRemove('5aa16ad329f0802f845fbdcf').then((doc) => {
  console.log(doc);
});
