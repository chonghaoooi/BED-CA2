//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
// Controller: exposes the player's latest ending summary based on their decisions.
const model = require("../models/endingModel.js");

// Handler: GET /ending/{user_id} – fetch the latest ending for the logged-in user.
module.exports.getUserEnding = (req, res, next) => {
  const data = {
    user_id: res.locals.userId,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error getUserEnding:", error);
      return res.status(500).json(error);
    } else if (results.length == 0) {
      return res.status(404).json({
        message: "No ending found for user",
      });
    } else {
      return res.status(200).json(results[0]);
    }
  };

  model.selectUserEnding(data, callback);
};
