const pool = require("../services/db");
// Model: reads suspect records used in the mystery and accusation flow.
// Query: return all suspects in the Suspect table.
module.exports.selectAllSuspects = (callback) => {
  const SQLSTATMENT = `
    SELECT * FROM Suspect;
    `;

  pool.query(SQLSTATMENT, callback);
};
