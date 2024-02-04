const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const { User } = require("../models/user");
const _ = require("lodash");

const router = express.Router();

//POST
router.post("/", (req, res) => {
  var body = _.pick(req.body, ["email", "password"]);
  var user = new User(body);

  console.log(user);
  user
    .save()
    .then(() => {
      //instead of res.send(user) we return the
      return user.generateAuthToken();
      //call the generateAuthToken method which puts a token into the database, then returns it
      //so we can use a .then() using the token variable
    })
    .then((token) => {
      //res.send(user);

      //using the token returned above, we can put it in the header so it can be used later.
      res.header("x-auth", token).send(user);

      //then catch any errors which may occur, such as incorrect data (invalid email/pass etc)
    })
    .catch((e) => {
      console.log(e);
      res.status(400).send(e);
    });
});

// router.get('/me', (req, res) => {
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

router.get("/me", authenticate, (req, res) => {
  res.send(req.user);
});

//POST /login {email, password}
router.post("/login", (req, res) => {
  var body = _.pick(req.body, ["email", "password"]);

  console.log("logging in", body.email);

  //verify user exists with email and password
  User.findByCredentials(body.email, body.password)
    .then((user) => {
      //exactly same as above
      return user.generateAuthToken().then((token) => {
        res.header("x-auth", token).send(user);
      });
    })
    .catch((e) => {
      res.status(400).send();
    });
  //then compare hashed password
  //res.send(body);
});

router.delete("/me/token", authenticate, (req, res) => {
  req.user.removeToken(req.token).then(
    () => {
      res.status(200).send();
    },
    () => {
      res.status(400).send();
    }
  );
});

module.exports = router;
