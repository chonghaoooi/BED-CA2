//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
// Model: provides read-only access to all clue items for the evidence board.
const pool = require("../services/db");

// Query: return all clues/evidence items for the evidence board.
module.exports.selectAllItems = (callback) => {
  const SQLSTATEMENT = `
    SELECT item_id, clue_name, clue_type, description, image_url
    FROM Item
    ORDER BY item_id;
  `;
  pool.query(SQLSTATEMENT, [], callback);
};
