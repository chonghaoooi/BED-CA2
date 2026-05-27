//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
// Controller: records challenge completions and updates user points.
const model = require("../models/userCompletionModel.js");
// Middleware: ensure the target challenge exists before recording a completion.
module.exports.verifyChallengeId = (req, res, next) => {
  if (req.body.details == undefined) {
    res.status(400).json({
      message: "Error: details is undefined",
    });
    return;
  }

  const data = {
    challenge_id: req.params.challenge_id,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error verifyChallengeId:", error);
      return res.status(500).json(error);
    } else if (results.length == 0) {
      res.status(404).json({
        message: "Challenge not found",
      });
    } else {
      return next();
    }
  };

  model.findChallengeId(data, callback);
};
// Middleware: ensure the completing user exists before inserting a record.
module.exports.verifyUserExists = (req, res, next) => {
  const data = {
    user_id: res.locals.userId,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error verifyUserExists:", error);
      return res.status(500).json(error);
    } else if (results.length == 0) {
      res.status(404).json({
        message: "User not found",
      });
    } else {
      return next();
    }
  };

  model.findUserId(data, callback);
};

// Middleware: insert a new completion row for the given challenge and user.
module.exports.postChallengeCompletionById = (req, res, next) => {
  const data = {
    challenge_id: req.params.challenge_id,
    user_id: res.locals.userId,
    details: req.body.details,
  };
  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error postChallengeCompletionById:", error);
      return res.status(500).json(error);
    }
    res.locals.completion = {
      completion_id: results.insertId,
      challenge_id: data.challenge_id,
      user_id: data.user_id,
      details: data.details,
    };
    return next();
  };

  model.postCompletionById(data, callback);
};
// Handler: update user points based on challenge reward and respond with completion info.
module.exports.updateUserPoints = (req, res, next) => {
  const data = {
    challenge_id: req.params.challenge_id,
    user_id: res.locals.userId,
  };
  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error updateUserPoints:", error);
      return res.status(500).json(error);
    }
    return res.status(201).json(res.locals.completion);
  };

  model.updatePoints(data, callback);
};
// Handler: GET /challenges/{challenge_id}/ – list all user attempts for that challenge.
module.exports.getCompletedChallengeById = (req, res, next) => {
  const data = {
    challenge_id: req.params.challenge_id,
  };
  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error getCompletedChallengeById:", error);
      return res.status(500).json(error);
    } else if (results.length == 0) {
      res.status(404).json({
        message: "No user attempts",
      });
    } else {
      const response = results.map((row) => ({
        user_id: row.user_id,
        details: row.details,
      }));
      return res.status(200).json(response);
    }
  };

  model.CompletedById(data, callback);
};
