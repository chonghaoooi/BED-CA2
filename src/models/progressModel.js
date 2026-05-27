const pool = require("../services/db");
// Model: aggregates user stats (points, clues, accusation/ending flags) for progress.
// Query: aggregate progress stats (points, clues, accusation/ending flags) for a user.
module.exports.selectUserProgress = (data, callback) => {
  const SQLSTATMENT = `
    SELECT
      u.user_id,
      u.points,
      (SELECT COUNT(*) FROM UserInventory ui WHERE ui.user_id = u.user_id) AS clues_collected,
      (SELECT COUNT(*) FROM Item) AS total_clues,
      (SELECT COUNT(*) FROM UserAccusation ua WHERE ua.user_id = u.user_id) AS has_accused,
      (SELECT COUNT(*) FROM UserEnding ue WHERE ue.user_id = u.user_id) AS has_ending
    FROM User u
    WHERE u.user_id = ?;
    `;
  const VALUES = [data.user_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};
