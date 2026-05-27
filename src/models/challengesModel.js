const pool = require("../services/db");
// Model: CRUD helpers for the WellnessChallenge and related completion data.
// Insert: create a new wellness challenge row.
//5. POST /challenges
module.exports.insertNewChallenge = (data, callback) => {
  const SQLSTATMENT = `
    INSERT INTO WellnessChallenge (creator_id, description, points)
    VALUES (?, ?, ?);
    `;
  const VALUES = [data.creator_id, data.description, data.points];

  pool.query(SQLSTATMENT, VALUES, callback);
};
// Query: list all wellness challenges.
//6. GET /challenges
module.exports.selectAllChallenges = (callback) => {
  const SQLSTATMENT = `
    SELECT * FROM WellnessChallenge;
    `;

  pool.query(SQLSTATMENT, callback);
};
// Delete: remove all completion rows tied to a challenge.
//7. DELETE /challenges/{challenge_id}
module.exports.deleteAllCompletions = (data, callback) => {
  const SQLSTATMENT = `
    DELETE FROM UserCompletion 
    WHERE challenge_id = ?;
    `;
  const VALUES = [data.challenge_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};
// Delete: remove the challenge itself by ID.
module.exports.deleteByChallengeId = (data, callback) => {
  const SQLSTATMENT = `
    DELETE FROM WellnessChallenge 
    WHERE challenge_id = ?;
    `;
  const VALUES = [data.challenge_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};
// Query: get the creator_id so we can enforce ownership.
//8. PUT /challenges/{challenge_id}
module.exports.findCreatorId = (data, callback) => {
  const SQLSTATMENT = `
    SELECT creator_id FROM WellnessChallenge
    WHERE challenge_id = ?;
    `;
  const VALUES = [data.challenge_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};
// Update: change description and points for a challenge.
module.exports.updateChallengeById = (data, callback) => {
  const SQLSTATMENT = `
    UPDATE WellnessChallenge
    SET description = ?, points = ?
    WHERE challenge_id = ?;
    `;
  const VALUES = [data.description, data.points, data.challenge_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};
