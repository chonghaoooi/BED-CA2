//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
// Controller: calculates and returns overall story progress for a user.
const model = require("../models/progressModel.js");

// Handler: GET /progress/{user_id} – return high-level story/game progress for the user.
module.exports.getUserProgress = (req, res, next) => {
  const data = {
    user_id: res.locals.userId,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error getUserProgress:", error);
      return res.status(500).json(error);
    } else if (results.length == 0) {
      return res.status(404).json({
        message: "User not found",
      });
    } else {
      const row = results[0];
      return res.status(200).json({
        user_id: row.user_id,
        points: row.points,
        clues_collected: row.clues_collected,
        total_clues: row.total_clues,
        can_accuse: row.clues_collected == row.total_clues,
        has_accused: row.has_accused > 0,
        has_ending: row.has_ending > 0,
      });
    }
  };

  model.selectUserProgress(data, callback);
};
