const pool = require("../services/db");
// Model: reads and clears a user's inventory, accusations, endings, and clues.
// Query: list all inventory items (clues) owned by a user.
module.exports.selectUserInventory = (data, callback) => {
  const SQLSTATMENT = `
    SELECT 
      i.item_id,
      i.clue_name,
      i.clue_type,
      i.description,
      i.image_url,
      ui.obtained_at
    FROM UserInventory ui
    JOIN Item i
      ON ui.item_id = i.item_id
    WHERE ui.user_id = ?;
    `;
  const VALUES = [data.user_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};
// Mutation: wipe endings, accusations, and inventory for a user (full reset).
module.exports.deleteUserProgress = (data, callback) => {
  const SQLSTATMENT = `
    DELETE FROM UserEnding WHERE user_id = ?;
    DELETE FROM UserAccusation WHERE user_id = ?;
    DELETE FROM UserInventory WHERE user_id = ?;
    `;
  const VALUES = [data.user_id, data.user_id, data.user_id];

  pool.query(SQLSTATMENT, VALUES, callback);
};
