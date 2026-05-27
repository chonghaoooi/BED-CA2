//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
// Controller: manages wellness challenges (CRUD) authored by users.
const model = require("../models/challengesModel.js");
// Handler: POST /challenges – create a new wellness challenge for the logged-in user.
module.exports.postChallenges = (req, res, next) => {
  if (
    req.body.description == undefined ||
    req.body.points == undefined
  ) {
    res.status(400).json({
      message: "Error: Description or points is undefined",
    });
    return;
  }
  const data = {
    description: req.body.description,
    creator_id: res.locals.userId,
    points: req.body.points,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error postChallenges:", error);
      return res.status(500).json(error);
    } else {
      return res.status(201).json({
        challenge_id: results.insertId,
        description: data.description,
        creator_id: data.creator_id,
        points: data.points,
      });
    }
  };

  model.insertNewChallenge(data, callback);
};
// Handler: GET /challenges – list all existing wellness challenges.
module.exports.readAllChallenges = (req, res, next) => {
  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error readAllChallenges:", error);
      return res.status(500).json(error);
    } else {
      return res.status(200).json(results);
    }
  };

  model.selectAllChallenges(callback);
};
// Middleware: ensure the logged-in user owns the challenge before deleting it.
module.exports.verifyChallengeOwnerForDelete = (req, res, next) => {
  const data = {
    challenge_id: req.params.challenge_id,
    creator_id: res.locals.userId,
  };
  model.findCreatorId(data, (error, results, fields) => {
    if (error) {
      console.error("Error verifyChallengeOwnerForDelete:", error);
      return res.status(500).json(error);
    }
    if (!results || results.length === 0) {
      return res.status(404).json({ message: "Challenge not found" });
    }
    if (results[0].creator_id != data.creator_id) {
      return res.status(403).json({ message: "Only the creator can delete this challenge" });
    }
    next();
  });
};
// Middleware: delete all completion records linked to a challenge.
module.exports.deleteAllChallengeCompletions = (req, res, next) => {
  const data = {
    challenge_id: req.params.challenge_id,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error deleteAllChallengeCompletions:", error);
      return res.status(500).json(error);
    } else {
      return next();
    }
  };

  model.deleteAllCompletions(data, callback);
};
// Handler: DELETE /challenges/{challenge_id} – remove the challenge itself.
module.exports.deleteChallengeById = (req, res, next) => {
  const data = {
    challenge_id: req.params.challenge_id,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error deleteChallengeById:", error);
      res.status(500).json(error);
    } else {
      if (results.affectedRows == 0) {
        return res.status(404).json({
          message: "Challenge not found",
        });
      } else {
        return res.status(204).send();
      }
    }
  };

  model.deleteByChallengeId(data, callback);
};
// Middleware: ensure the logged-in user owns the challenge before updating it.
module.exports.verifyChallengeOwner = (req, res, next) => {
  if (
    req.body.description == undefined ||
    req.body.points == undefined
  ) {
    res.status(400).json({
      message: "Error: description or points is undefined",
    });
    return;
  }

  const data = {
    challenge_id: req.params.challenge_id,
    creator_id: res.locals.userId,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error verifyChallengeOwner:", error);
      return res.status(500).json(error);
    } else if (results.length == 0) {
      return res.status(404).json({
        message: "Challenge not found",
      });
    } else if (results[0].creator_id == data.creator_id) {
      return next();
    } else {
      return res.status(403).json({ message: "Wrong Owner" });
    }
  };

  model.findCreatorId(data, callback);
};
// Handler: PUT /challenges/{challenge_id} – update description/points for a challenge.
module.exports.updateChallengeById = (req, res, next) => {
  const data = {
    challenge_id: req.params.challenge_id,
    creator_id: res.locals.userId,
    description: req.body.description,
    points: req.body.points,
  };
  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error updateChallengeById:", error);
      return res.status(500).json(error);
    } else {
      return res.status(200).json({
        challenge_id: data.challenge_id,
        description: data.description,
        creator_id: data.creator_id,
        points: data.points,
      });
    }
  };

  model.updateChallengeById(data, callback);
};
