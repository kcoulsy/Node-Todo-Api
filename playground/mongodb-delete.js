//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if(err) {
    return console.log(`Unable to connect to MongoDB server`);
  }
  console.log('Connected to MongoDB server');

  //deleteMany
  // db.collection('Todos').deleteMany({text: 'Something here'}).then((result) => {
  //   console.log(result);
  // });
  //deleteOne
  db.collection('Todos').findOneAndDelete({text: 'item'}).then((result) =>{
    console.log(result);
  })
  //findOneAndDelete - also returns the values

  //db.close();
});
