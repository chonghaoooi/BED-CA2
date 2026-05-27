//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
// Controller: returns the list of all mystery suspects for the frontend.
const model = require("../models/suspectsModel.js");

// Handler: GET /suspects – return all suspects for the mystery.
module.exports.readAllSuspects = (req, res, next) => {
  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error readAllSuspects:", error);
      return res.status(500).json(error);
    } else {
      return res.status(200).json(results);
    }
  };

  model.selectAllSuspects(callback);
};
