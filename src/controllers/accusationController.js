//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
// Controller: drives the final accusation flow and assigns an ending to the user.
const model = require("../models/accusationModel.js");

// Middleware: ensure the requesting user exists before recording an accusation.
module.exports.verifyUserExists = (req, res, next) => {
  if (req.body.suspect_id == undefined) {
    res.status(400).json({
      message: "Error: suspect_id is undefined",
    });
    return;
  }

  const data = {
    user_id: res.locals.userId,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error verifyUserExists:", error);
      return res.status(500).json(error);
    } else if (results.length == 0) {
      return res.status(404).json({
        message: "User not found",
      });
    } else {
      return next();
    }
  };

  model.findUserById(data, callback);
};

// Middleware: ensure the chosen suspect exists before proceeding.
module.exports.verifySuspectExists = (req, res, next) => {
  const data = {
    suspect_id: req.body.suspect_id,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error verifySuspectExists:", error);
      return res.status(500).json(error);
    } else if (results.length == 0) {
      return res.status(404).json({
        message: "Suspect not found",
      });
    } else {
      return next();
    }
  };

  model.findSuspectById(data, callback);
};

// Middleware: block users from making more than one accusation.
module.exports.preventDuplicateAccusation = (req, res, next) => {
  const data = {
    user_id: res.locals.userId,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error preventDuplicateAccusation:", error);
      return res.status(500).json(error);
    } else if (results.length > 0) {
      return res.status(409).json({
        message: "User has already made an accusation",
      });
    } else {
      return next();
    }
  };

  model.findAccusationByUserId(data, callback);
};

// Middleware: insert the user's accusation into the database.
module.exports.insertAccusation = (req, res, next) => {
  const data = {
    user_id: res.locals.userId,
    suspect_id: req.body.suspect_id,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error insertAccusation:", error);
      return res.status(500).json(error);
    } else {
      return next();
    }
  };

  model.insertUserAccusation(data, callback);
};

// Middleware: grant the user an ending based on the accused suspect.
module.exports.insertUserEnding = (req, res, next) => {
  const data = {
    user_id: res.locals.userId,
    suspect_id: req.body.suspect_id,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error insertUserEnding:", error);
      return res.status(500).json(error);
    } else {
      return next();
    }
  };

  model.insertEndingForUser(data, callback);
};

// Handler: return the ending details after a successful accusation.
module.exports.returnEnding = (req, res, next) => {
  const data = {
    user_id: res.locals.userId,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error returnEnding:", error);
      return res.status(500).json(error);
    } else {
      return res.status(201).json(results[0]);
    }
  };

  model.selectUserEndingDetails(data, callback);
};
