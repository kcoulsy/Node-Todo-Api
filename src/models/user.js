const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcryptjs");

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "{VALUE} is not a valid email!",
    },
  },
  password: {
    type: String,
    require: true,
    minlength: 6,
  },
  tokens: [
    {
      access: {
        type: String,
        require: true,
      },
      token: {
        type: String,
        require: true,
      },
    },
  ],
});

UserSchema.methods.toJSON = function () {
  //overriding what is returned when the document is converted to json.
  //ie. if we return a json (as we do), we're going to pick out the id and email only to send
  var user = this;
  var userObject = user.toObject(); //creates an object of the user

  return _.pick(userObject, ["_id", "email"]);
};

//Generaates an auth token to send back to the user when they make a request
//uses function() rather than es6, as we need the this. keyword.
UserSchema.methods.generateAuthToken = function () {
  //get the document the use method was called on
  var user = this;
  //set the access property
  var access = "auth";
  //use jwt to create a token, using jwt.sign, using the data of id and the access property.
  //Secret key is temporarily set to 'abc', set it to a string to return in back
  //this key is also in seed.js and in the generateAuthToken method.
  var token = jwt
    .sign({ _id: user._id.toHexString(), access }, process.env.JWT_SECRET)
    .toString();

  //add this new token to the tokens array within the user document.
  // .push is inconsistent. Just concat it to the array
  user.tokens = user.tokens.concat([{ access, token }]);

  //save it to the database. Using a callback function, we can return token to we can use it in server.js
  return user.save().then(() => {
    return token;
  });
};

UserSchema.methods.removeToken = function (token) {
  var user = this;

  return user.update({
    $pull: {
      tokens: { token },
    },
  });
};

//using statics as it is a model method rather than a instance methods
//instance methods require the data, this doesn't
UserSchema.statics.findByToken = function (token) {
  //the model is bound to this
  var User = this;
  var decoded; //stores the decoded jwt values

  //the verify method will throw an error if it fails so using a try catch block
  try {
    //so try jwt.verify using the token and the same secret that was set in
    //generateAuthToken, if it fails it moves forward else it sets it to decoded
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return Promise.reject();
  }

  //if we were able to decoded it, we will return the user found so we can use .then in server.js
  return User.findOne({
    _id: decoded._id,
    "tokens.token": token,
    "tokens.access": "auth", //quotes required when a . in the label
  });
};

//using this to hash the password, using bcrypt as it salts it automatically
//mongoose middleware, this 'pre' will run before we do the 'save' method. Using function(next) because we need
//to use the this. and 'next' is required or it will be stuck here
UserSchema.pre("save", function (next) {
  var user = this;

  //we don't want to rehash our hashed password.
  //in this case isModified is going from nothing to something = modified.
  if (user.isModified("password")) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

UserSchema.statics.findByCredentials = function (email, password) {
  var User = this;

  //first find a user with the same email. Returning this function to use .then and callback
  //to the server.js
  return User.findOne({ email }).then((user) => {
    //no user = reject. will trigger the catch(e) and return a 400
    if (!user) {
      return Promise.reject();
    }

    console.log("found user", user.email, user.password, password);
    2;

    //now to check the password is the same. Using a promise here but bycrypt uses callbacks
    //create a new Promise to use reject() and resolve()
    return new Promise((resolve, reject) => {
      //compare the inputted password with the one that was found
      bcrypt.compare(password, user.password, (err, res) => {
        //if res = true then resolve else reject
        if (res) {
          resolve(user);
        } else {
          reject();
        }

        //rejecting would skip it to the catch(e) block, else it will return the user id/email
      });
    });
  });
};

var User = mongoose.model("Users", UserSchema);

module.exports = { User };
