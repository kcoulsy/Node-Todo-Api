const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");

require("dotenv").config();

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// basic logging middleware
app.use((req, res, next) => {
  console.log("Request: ", req.method, req.url);
  next();
});

app.use("/todos", require("./routes/todos"));
app.use("/users", require("./routes/user"));

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = { app };
