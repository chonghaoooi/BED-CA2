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

// Stats for dashboard
module.exports.getStats = (callback) => {
  const SQL = `
    SELECT
      (SELECT COUNT(*) FROM User) AS totalUsers,
      (SELECT COUNT(*) FROM WellnessChallenge) AS totalChallenges,
      (SELECT COUNT(*) FROM UserCompletion) AS totalCompletions,
      (SELECT COALESCE(SUM(points),0) FROM User) AS totalPoints,
      (SELECT COUNT(*) FROM UserInventory) AS totalClues,
      (SELECT COUNT(*) FROM UserAccusation) AS totalAccusations,
      (SELECT COUNT(*) FROM UserEnding ue JOIN Ending e ON ue.ending_id = e.ending_id WHERE e.is_true_culprit = 1) AS solvedCase;
  `;
  pool.query(SQL, callback);
};

module.exports.getTopUsers = (callback) => {
  const SQL = `SELECT username, points FROM User ORDER BY points DESC LIMIT 10;`;
  pool.query(SQL, callback);
};

module.exports.getChallengeCompletions = (callback) => {
  const SQL = `
    SELECT wc.description, COUNT(uc.completion_id) AS completions
    FROM WellnessChallenge wc
    LEFT JOIN UserCompletion uc ON wc.challenge_id = uc.challenge_id
    GROUP BY wc.challenge_id, wc.description
    ORDER BY completions DESC;
  `;
  pool.query(SQL, callback);
};

module.exports.getSuspectAccusations = (callback) => {
  const SQL = `
    SELECT s.name, COUNT(ua.user_id) AS accusations
    FROM Suspect s
    LEFT JOIN UserAccusation ua ON s.suspect_id = ua.suspect_id
    GROUP BY s.suspect_id, s.name
    ORDER BY accusations DESC;
  `;
  pool.query(SQL, callback);
};

module.exports.getEndingDistribution = (callback) => {
  const SQL = `
    SELECT e.title, e.is_true_culprit, COUNT(ue.user_id) AS obtained
    FROM Ending e
    LEFT JOIN UserEnding ue ON e.ending_id = ue.ending_id
    GROUP BY e.ending_id, e.title, e.is_true_culprit
    ORDER BY obtained DESC;
  `;
  pool.query(SQL, callback);
};
