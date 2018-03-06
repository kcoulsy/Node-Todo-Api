//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if(err) {
    return console.log(`Unable to connect to MongoDB server`);
  }
  console.log('Connected to MongoDB server');

  // db.collection('Users').find({_id: new ObjectID('5a9e8d5cdc18ac3398b4039b')}).toArray().then((docs) => {
  //   console.log('Users');
  //   console.log(JSON.stringify(docs, undefined, 2));
  // }, (err) => {
  //   console.log('Unable to fetch data', err);
  // });
  db.collection('Users').find().count().then((count) => {
    console.log(`User Count: ${count}`);
  }, (err) => {
    console.log('Unable to fetch data', err);
  });
  //db.close();
});
