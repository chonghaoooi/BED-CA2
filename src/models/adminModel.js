const pool = require("../services/db");

// Get all users with their login info
module.exports.getAllUsers = (callback) => {
  const SQL = `
    SELECT u.user_id, u.username, u.points, u.created_on, ul.email
    FROM User u
    JOIN Userlogin ul ON ul.username = u.username
    ORDER BY u.user_id ASC;
  `;
  pool.query(SQL, callback);
};

// Delete a user and all their data
module.exports.deleteUserById = (data, callback) => {
  const SQL = `
    DELETE FROM UserEnding WHERE user_id = ?;
    DELETE FROM UserAccusation WHERE user_id = ?;
    DELETE FROM UserInventory WHERE user_id = ?;
    DELETE FROM UserCompletion WHERE user_id = ?;
    DELETE FROM Userlogin WHERE username = (SELECT username FROM User WHERE user_id = ?);
    DELETE FROM User WHERE user_id = ?;
  `;
  const VALUES = [data.user_id, data.user_id, data.user_id, data.user_id, data.user_id, data.user_id];
  pool.query(SQL, VALUES, callback);
};

// Get all wellness challenges
module.exports.getAllChallenges = (callback) => {
  const SQL = `SELECT * FROM WellnessChallenge ORDER BY challenge_id ASC;`;
  pool.query(SQL, callback);
};

// Delete a challenge and its completions
module.exports.deleteChallengeById = (data, callback) => {
  const SQL = `
    DELETE FROM UserCompletion WHERE challenge_id = ?;
    DELETE FROM WellnessChallenge WHERE challenge_id = ?;
  `;
  const VALUES = [data.challenge_id, data.challenge_id];
  pool.query(SQL, VALUES, callback);
};
