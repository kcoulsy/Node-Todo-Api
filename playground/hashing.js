const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');

var data = {
  id:20
};

var token = jwt.sign(data, '123abc');
var decoded = jwt.verify(token, '123abc');
console.log(token);
console.log(decoded);
// var message = 'I am user number 3';
// var hash = SHA256(message).toString();
//
// console.log(message,hash);
//
// var data = {
//   id: 4
// };
//
// var token = {
//   data,
//   hash: SHA256(JSON.stringify(data) + 'some secret').toString()
// }
//
// token.data.id = 5;
// token.hash = SHA256(JSON.stringify(token.data)).toString();
//
// var resultHash = SHA256(JSON.stringify(token.data) + 'some secret').toString();
// if(resultHash === token.hash) {
//   console.log('Data was not changed');
// } else {
//   console.log('do not trust');
// }
//
//
