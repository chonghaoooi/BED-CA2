const pool = require("../services/db");
// Model: supports the accusation flow by checking users/suspects and writing outcomes.
// Query: verify that a user exists before accusing.
module.exports.findUserById = (data, callback) => {
  const SQLSTATMENT = `
    SELECT * FROM User
    WHERE user_id = ?;
    `;
  const VALUES = [data.user_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};

// Query: verify that a suspect exists before accusing them.
module.exports.findSuspectById = (data, callback) => {
  const SQLSTATMENT = `
    SELECT * FROM Suspect
    WHERE suspect_id = ?;
    `;
  const VALUES = [data.suspect_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};

// Query: check whether this user has already made an accusation.
module.exports.findAccusationByUserId = (data, callback) => {
  const SQLSTATMENT = `
    SELECT * FROM UserAccusation
    WHERE user_id = ?;
    `;
  const VALUES = [data.user_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};

// Insert: record which suspect the user accused.
module.exports.insertUserAccusation = (data, callback) => {
  const SQLSTATMENT = `
    INSERT INTO UserAccusation (user_id, suspect_id)
    VALUES (?, ?);
    `;
  const VALUES = [data.user_id, data.suspect_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};

// Insert: give the user an ending based on the suspect accused.
module.exports.insertEndingForUser = (data, callback) => {
  const SQLSTATMENT = `
    INSERT INTO UserEnding (user_id, ending_id)
    SELECT ?, e.ending_id
    FROM Ending e
    WHERE e.suspect_id = ?;
    `;
  const VALUES = [data.user_id, data.suspect_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};

// Query: fetch the most recent ending details for a given user.
module.exports.selectUserEndingDetails = (data, callback) => {
  const SQLSTATMENT = `
    SELECT 
      e.ending_id,
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
