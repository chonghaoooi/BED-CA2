//////////////////////////////////////////////////////
// REQUIRE MODULES
// Model: handles registration/login queries against the Userlogin table.
//////////////////////////////////////////////////////
const pool = require("../services/db");
//////////////////////////////////////////////////////
// Validation: check if a username or email is already taken.
//////////////////////////////////////////////////////
module.exports.checkUsernameOrEmailExist = (data, callback) => {
  const SQL = `
    SELECT 1
    FROM Userlogin
    WHERE username = ? OR email = ?
    LIMIT 1;
  `;

  pool.query(SQL, [data.username, data.email], callback);
};

// Insert: create a new Userlogin record.
module.exports.register = (data, callback) => {
  const SQLSTATMENT = `
    INSERT INTO UserLogin (username, email, password)
    VALUES (?, ?, ?)
    `;
  const VALUES = [data.username, data.email, data.password];

  pool.query(SQLSTATMENT, VALUES, callback);
};
// Query: retrieve password hash for a username during login.
module.exports.login = (data, callback) => {
  const SQLSTATMENT = `
    SELECT password FROM Userlogin
    where username = ?;
    `;
  const VALUES = [data.username];

  pool.query(SQLSTATMENT, VALUES, callback);
};

// Update: change username in Userlogin when profile username changes.
module.exports.updateUsername = (data, callback) => {
  const SQL = `
    UPDATE Userlogin
    SET username = ?, updated_on = CURRENT_TIMESTAMP
    WHERE username = ?;
  `;
  pool.query(SQL, [data.new_username, data.old_username], callback);
};
