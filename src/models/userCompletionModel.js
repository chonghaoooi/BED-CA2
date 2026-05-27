const pool = require("../services/db");
// Model: validates challenges/users, records completions, and updates points.
// Query: verify a challenge exists by its challenge_id.
module.exports.findChallengeId = (data, callback) => {
  const SQLSTATMENT = `
    SELECT * FROM WellnessChallenge
    WHERE challenge_id = ?;
    `;
  const VALUES = [data.challenge_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};
// Query: verify a user exists by user_id.
module.exports.findUserId = (data, callback) => {
  const SQLSTATMENT = `
    SELECT * FROM User
    WHERE user_id = ?;
    `;
  const VALUES = [data.user_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};
// Insert: create a new completion record for a user and challenge.
module.exports.postCompletionById = (data, callback) => {
  const SQLSTATMENT = `
    INSERT INTO UserCompletion (challenge_id, user_id, details)
    VALUES (?, ?, ?);
    `;
  const VALUES = [data.challenge_id, data.user_id, data.details];

  pool.query(SQLSTATMENT, VALUES, callback);
};
// Update: add challenge points to a user's total.
module.exports.updatePoints = (data, callback) => {
  const SQLSTATMENT = `
    UPDATE User u
    JOIN WellnessChallenge w
        ON w.challenge_id = ?
    SET u.points = u.points + w.points
    WHERE u.user_id = ?
    `;
  const VALUES = [data.challenge_id, data.user_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};
// Query: list all completion rows for a specific challenge_id.
module.exports.CompletedById = (data, callback) => {
  const SQLSTATMENT = `
    SELECT * FROM UserCompletion
    WHERE challenge_id = ?;
    `;
  const VALUES = [data.challenge_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};
