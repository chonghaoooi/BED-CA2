const pool = require("../services/db");
// Model: queries the Ending/UserEnding tables to fetch a user's latest ending.
// Query: get the most recent ending unlocked by a specific user.
module.exports.selectUserEnding = (data, callback) => {
  const SQLSTATMENT = `
    SELECT 
      e.ending_id,
      e.suspect_id,
      e.title,
      e.description,
      e.is_true_culprit,
      ue.obtained_at
    FROM UserEnding ue
    JOIN Ending e
      ON ue.ending_id = e.ending_id
    WHERE ue.user_id = ?
    ORDER BY ue.obtained_at DESC
    LIMIT 1;
    `;
  const VALUES = [data.user_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};
