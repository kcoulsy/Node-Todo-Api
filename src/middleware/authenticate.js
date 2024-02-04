var {User} = require('./../models/user');

var authenticate =  (req, res, next) => {
  var token = req.header('x-auth');

  User.findByToken(token).then((user) => {
    if(!user){
      return Promise.reject(); //function automatically stops and goes to the catch block
    }
    req.user = user;
    req.token = token;
    next();
  }).catch((e)=>{
    res.status(401).send();//401 means that authentication is required
  });
};


module.exports = {authenticate};
