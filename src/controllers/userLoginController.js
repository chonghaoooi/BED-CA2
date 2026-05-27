//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
// Controller: handles user registration and login before JWT generation.
const model = require("../models/userLoginModel.js");
const usersModel = require("../models/usersModel.js");
module.exports.checkUsernameOrEmailExist = (req, res, next) => {
  if (
    req.body.username == undefined ||
    req.body.email == undefined ||
    req.body.password == undefined
  ) {
    res.status(400).json({
      message: "Error: username,email or password is undefined",
    });
    return;
  }
  const data = {
    username: req.body.username,
    email: req.body.email,
  };

  model.checkUsernameOrEmailExist(data, (error, results) => {
    if (error) {
      return res.status(500).json(error);
    }

    if (results.length > 0) {
      return res.status(409).json({
        message: "Username or email already exists",
      });
    }

    next(); // continue to hashPassword → register
  });
};

// Handle user registration after password has been hashed (creates login row + seeds userId for JWT).
module.exports.register = (req, res, next) => {
  const data = {
    username: req.body.username,
    email: req.body.email,
    password: res.locals.hash,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error register:", error);
      return res.status(500).json(error);
    }

    // store primary key for next middleware (JWT generation)
    res.locals.userId = results.insertId;
    res.locals.message = `User ${req.body.username} created successfully.`;

    next(); // continue to jwtMiddleware.generateToken
  };

  model.register(data, callback);
};
// Handle login: validate credentials, load hashed password + userId for bcrypt + JWT middlewares.
module.exports.login = (req, res, next) => {
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({
      message: "Error: Username or password is undefined",
    });
  }

  const data = {
    username: req.body.username,
  };

  model.login(data, (error, results) => {
    if (error) {
      return res.status(500).json(error);
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.locals.hash = results[0].password;

    // Get User.user_id so JWT and GET /api/users/:user_id work
    usersModel.selectByUsername({ username: data.username }, (err2, userRows) => {
      if (err2) return res.status(500).json(err2);
      if (!userRows || userRows.length === 0) {
        return res.status(500).json({ message: "User record not found" });
      }
      res.locals.userId = userRows[0].user_id;
      next();
    });
  });
};
