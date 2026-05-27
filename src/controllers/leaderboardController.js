//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
// Controller: exposes solved and unsolved leaderboards based on completion time.
const model = require("../models/leaderboardModel.js");

// Handler: GET /leaderboard – fastest players who caught the true culprit.
module.exports.getLeaderboard = (req, res, next) => {
  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error getLeaderboard:", error);
      return res.status(500).json(error);
    } else if (results.length == 0) {
      return res.status(404).json({
        message: "No qualified completions found",
      });
    } else {
      return res.status(200).json(results);
    }
  };

  model.selectLeaderboard(callback);
};

// Handler: GET /leaderboard/unsolved – fastest completions with a wrong culprit.
module.exports.getLeaderboardUnsolved = (req, res, next) => {
  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error getLeaderboardUnsolved:", error);
      return res.status(500).json(error);
    } else if (results.length == 0) {
      return res.status(404).json({
        message: "No wrong-culprit completions found",
      });
    } else {
      return res.status(200).json(results);
    }
  };

  model.selectLeaderboardUnsolved(callback);
};
