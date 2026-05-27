const pool = require("../services/db");
// Model: computes solved/unsolved leaderboards based on completion time windows.
// Query: compute fastest true-culprit completions for the main leaderboard.
module.exports.selectLeaderboard = (callback) => {
  const SQLSTATMENT = `
    SELECT
      u.user_id,
      u.username,
      MIN(ui.obtained_at) AS start_time,
      MIN(ue.obtained_at) AS end_time,
      TIMESTAMPDIFF(SECOND, MIN(ui.obtained_at), MIN(ue.obtained_at)) AS completion_seconds
    FROM User u
    JOIN UserEnding ue
      ON ue.user_id = u.user_id
    JOIN Ending e
      ON e.ending_id = ue.ending_id
    JOIN UserInventory ui
      ON ui.user_id = u.user_id
    WHERE e.is_true_culprit = 1
    GROUP BY u.user_id, u.username
    ORDER BY completion_seconds ASC
    LIMIT 10;
    `;

  pool.query(SQLSTATMENT, callback);
};

// Query: compute fastest completions where the culprit was wrong.
module.exports.selectLeaderboardUnsolved = (callback) => {
  const SQLSTATMENT = `
    SELECT
      u.user_id,
      u.username,
      MIN(ui.obtained_at) AS start_time,
      MIN(ue.obtained_at) AS end_time,
      TIMESTAMPDIFF(SECOND, MIN(ui.obtained_at), MIN(ue.obtained_at)) AS completion_seconds
    FROM User u
    JOIN UserEnding ue
      ON ue.user_id = u.user_id
    JOIN Ending e
      ON e.ending_id = ue.ending_id
    JOIN UserInventory ui
      ON ui.user_id = u.user_id
    WHERE e.is_true_culprit = 0
    GROUP BY u.user_id, u.username
    ORDER BY completion_seconds ASC
    LIMIT 10;
    `;

  pool.query(SQLSTATMENT, callback);
};
