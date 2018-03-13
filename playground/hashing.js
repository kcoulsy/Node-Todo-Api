const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');



var password = '123abc!';

// bcrypt.genSalt(10, (err, salt) =>{
//     bcrypt.hash(password, salt, (err,hash)=>{
//       console.log(hash);
//     });
// });

var hashedPassword = '$2a$10$rVQW7mt6rd2aIBgjPQhsaeHQg815UdboJVPAwZYB35w0QlwKmQ5O2';

bcrypt.compare(password, hashedPassword, (err, res)=>{
  console.log(res);
});






















// var message = 'non hashes message';
// var hash = SHA256(message).toString();
//
// console.log(message, hash);
//
// var data = {
//   id: 1
// }
//
//
// var token = jwt.sign(data, '123');
// console.log(token);
//
// var decoded = jwt.verify(token, '123');
// console.log('decoded: ', decoded);


// var token  = {
//   data,
//   hash: SHA256(JSON.stringify(data) + "salt1").toString()
// }
//
// token.data.id = 4;
// token.hash = SHA256(JSON.stringify(token.data)).toString();
//
// var resultHash = SHA256(JSON.stringify(token.data) + "salt1").toString();
//
// if(resultHash === token.hash) {
//   console.log('data was not changed');
// } else {
//   console.log('data changed');
// }
