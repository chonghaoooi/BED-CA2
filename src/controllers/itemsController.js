//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
// Controller: exposes all static clue items for the evidence board.
const model = require("../models/itemsModel.js");

// Handler: GET /items – return all clues (items) for the evidence board.
module.exports.readAllItems = (req, res, next) => {
  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error readAllItems:", error);
      return res.status(500).json(error);
    }
    return res.status(200).json(results);
  };
  model.selectAllItems(callback);
};
