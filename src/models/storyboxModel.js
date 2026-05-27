const pool = require("../services/db");
// Model: powers the storybox feature (points checks, random clue selection, inventory writes).
// Query: get the current points balance for a user.
module.exports.selectUserPoints = (data, callback) => {
  const SQLSTATMENT = `
    SELECT points FROM User
    WHERE user_id = ?;
    `;
  const VALUES = [data.user_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};

// Query: pick a random clue that the user does not already own.
module.exports.selectRandomUnownedClue = (data, callback) => {
  const SQLSTATMENT = `
    SELECT item_id
    FROM Item
    WHERE item_id NOT IN (
      SELECT item_id FROM UserInventory
      WHERE user_id = ?
    )
    ORDER BY RAND()
    LIMIT 1;
    `;
  const VALUES = [data.user_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};

// Insert: add a clue to the UserInventory table.
module.exports.insertInventory = (data, callback) => {
  const SQLSTATMENT = `
    INSERT INTO UserInventory (user_id, item_id)
    VALUES (?, ?);
    `;
  const VALUES = [data.user_id, data.item_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};

// Update: deduct a fixed number of points when opening the storybox.
module.exports.deductPoints = (data, callback) => {
  const SQLSTATMENT = `
    UPDATE User
    SET points = points - 20
    WHERE user_id = ?;
    `;
  const VALUES = [data.user_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};

// Query: fetch full clue details for a specific item_id.
module.exports.selectClueById = (data, callback) => {
  const SQLSTATMENT = `
    SELECT * FROM Item
    WHERE item_id = ?;
    `;
  const VALUES = [data.item_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};
