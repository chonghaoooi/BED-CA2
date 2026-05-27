//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
// Controller: handles the storybox mechanic where users spend points to unlock random clues.
const model = require("../models/storyboxModel.js");

// Middleware: ensure the user has enough points to open the storybox.
module.exports.verifyUserPoints = (req, res, next) => {
  const data = {
    user_id: res.locals.userId,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error verifyUserPoints:", error);
      return res.status(500).json(error);
    } else if (results.length == 0) {
      return res.status(404).json({
        message: "User not found",
      });
    } else if (results[0].points < 20) {
      return res.status(403).json({
        message: "Not enough points",
      });
    } else {
      return next();
    }
  };

  model.selectUserPoints(data, callback);
};

// Middleware: pick a random clue the user does not already own.
module.exports.getRandomClue = (req, res, next) => {
  const data = {
    user_id: res.locals.userId,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error getRandomClue:", error);
      return res.status(500).json(error);
    } else if (results.length == 0) {
      return res.status(409).json({
        message: "All clues collected",
      });
    } else {
      res.locals.item_id = results[0].item_id;
      return next();
    }
  };

  model.selectRandomUnownedClue(data, callback);
};

// Middleware: insert the newly won clue into the user's inventory.
module.exports.insertUserInventory = (req, res, next) => {
  const data = {
    user_id: res.locals.userId,
    item_id: res.locals.item_id,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error insertUserInventory:", error);
      return res.status(500).json(error);
    } else {
      return next();
    }
  };

  model.insertInventory(data, callback);
};

// Middleware: deduct the cost in points for opening the storybox.
module.exports.deductUserPoints = (req, res, next) => {
  const data = {
    user_id: res.locals.userId,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error deductUserPoints:", error);
      return res.status(500).json(error);
    } else {
      return next();
    }
  };

  model.deductPoints(data, callback);
};

// Handler: return the full clue details after a successful storybox roll.
module.exports.returnClue = (req, res, next) => {
  const data = {
    item_id: res.locals.item_id,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error returnClue:", error);
      return res.status(500).json(error);
    } else {
      return res.status(201).json(results[0]);
    }
  };

  model.selectClueById(data, callback);
};
