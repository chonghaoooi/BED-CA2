//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
// Controller: handles user profile reads/updates and keeps login records in sync.
const model = require("../models/usersModel.js");
const userLoginModel = require("../models/userLoginModel.js");

// Middleware: ensure the authenticated user can only access their own profile.
module.exports.ensureOwnUser = (req, res, next) => {
  const requestedId = req.params.user_id;
  const authUserId = res.locals.userId;
  if (String(requestedId) !== String(authUserId)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

// Middleware: internal step in /api/register to create a matching User row.
module.exports.createNewUser = (req, res, next) => {
  const data = {
    username: req.body.username,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error createNewUser:", error);
      return res.status(500).json(error);
    } else {
      // JWT and GET /api/users/:user_id use User.user_id
      res.locals.userId = results.insertId;
      return next();
    }
  };

  model.insertNewUser(data, callback);
};

// Handler: GET /users/{user_id} – return a single user profile.
module.exports.readUserById = (req, res, next) => {
  const data = {
    user_id: req.params.user_id,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error readUserById:", error);
      return res.status(500).json(error);
    } else {
      if (results.length == 0) {
        return res.status(404).json({
          message: "User not found",
        });
      } else {
        return res.status(200).json(results[0]);
      }
    }
  };

  model.selectByUserId(data, callback);
};
// Middleware: check for username conflicts before updating a user.
module.exports.detectUsernameConflictForUpdate = (req, res, next) => {
  if (req.body.username == undefined || req.body.points == undefined) {
    res.status(400).json({
      message: "Error: Username or Points is undefined",
    });
    return;
  }

  const data = {
    username: req.body.username,
    user_id: req.params.user_id,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error detectUsernameConflictForUpdate:", error);
      return res.status(500).json(error);
    } else if (results.length > 0) {
      return res.status(409).json({ message: "Username already exists." });
    } else {
      return next();
    }
  };

  model.findConflictByUsername(data, callback);
};
// Handler: PUT /users/{user_id} – update username/points and sync login username.
module.exports.updateUserById = (req, res, next) => {
  const data = {
    user_id: req.params.user_id,
    username: req.body.username,
    points: req.body.points,
  };

  model.selectByUserId({ user_id: data.user_id }, (err, rows) => {
    if (err) {
      console.error("Error selectByUserId:", err);
      return res.status(500).json(err);
    }
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const oldUsername = rows[0].username;

    model.updateUserById(data, (error, results, fields) => {
      if (error) {
        console.error("Error updateUserById:", error);
        return res.status(500).json(error);
      }
      if (results && results.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      if (oldUsername === data.username) {
        return res.status(200).json({
          user_id: data.user_id,
          username: data.username,
          points: data.points,
        });
      }

      userLoginModel.updateUsername(
        { old_username: oldUsername, new_username: data.username },
        (errLogin, resultLogin) => {
          if (errLogin) {
            console.error("Error updateUserlogin username:", errLogin);
            return res.status(500).json({ message: "User updated but login name sync failed" });
          }
          return res.status(200).json({
            user_id: data.user_id,
            username: data.username,
            points: data.points,
          });
        }
      );
    });
  });
};
