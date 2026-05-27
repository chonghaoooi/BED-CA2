const pool = require("../services/db");
// Model: SQL helpers for the User table (profiles and points).
// Helper: look up a user by username (used by login and sanity checks).
module.exports.selectByUsername = (data, callback) => {
  const SQLSTATMENT = `
    SELECT * FROM User
    WHERE username = ?;
    `;
  const VALUES = [data.username];

  pool.query(SQLSTATMENT, VALUES, callback);
};
// Insert: create a new User row during the registration flow.
module.exports.insertNewUser = (data, callback) => {
  const SQLSTATMENT = `
    INSERT INTO User (username)
    VALUES (?);
    `;
  const VALUES = [data.username];

  pool.query(SQLSTATMENT, VALUES, callback);
};
// Read: fetch a single user by user_id.
module.exports.selectByUserId = (data, callback) => {
  const SQLSTATMENT = `
    SELECT * FROM User
    WHERE user_id = ?;
    `;
  const VALUES = [data.user_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};
// Helper: check if another user already owns the same username.
module.exports.findConflictByUsername = (data, callback) => {
  const SQLSTATMENT = `
    SELECT * FROM User
    WHERE username = ?
      AND user_id <> ?;
    `;
  const VALUES = [data.username, data.user_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};

// Update: modify username and points for a given user_id.
module.exports.updateUserById = (data, callback) => {
  const SQLSTATMENT = `
    UPDATE User
    SET username = ?, points = ?
    WHERE user_id = ?;
    `;
  const VALUES = [data.username, data.points, data.user_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};
