//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
// Controller: returns and resets a player's collected clues inventory.
const model = require("../models/inventoryModel.js");

// Handler: GET /inventory/{user_id} – return all clues collected by the logged-in user.
module.exports.getUserInventory = (req, res, next) => {
  const data = {
    user_id: res.locals.userId,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error getUserInventory:", error);
      return res.status(500).json(error);
    }
    return res.status(200).json(Array.isArray(results) ? results : []);
  };

  model.selectUserInventory(data, callback);
};
// Handler: DELETE /inventory/{user_id} – reset a user's inventory and progress-related tables.
module.exports.resetUserInventory = (req, res, next) => {
  const data = {
    user_id: res.locals.userId,
  };

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error resetUserInventory:", error);
      return res.status(500).json(error);
    } else {
      return res.status(204).send();
    }
  };

  model.deleteUserProgress(data, callback);
};
