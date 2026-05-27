const adminModel = require("../models/adminModel");

module.exports.getAllUsers = (req, res) => {
  adminModel.getAllUsers((err, results) => {
    if (err) {
      console.error("Admin getAllUsers error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.status(200).json(results);
  });
};

module.exports.deleteUser = (req, res) => {
  const user_id = parseInt(req.params.user_id);

  if (user_id === 1) {
    return res.status(403).json({ error: "Cannot delete the admin account" });
  }

  adminModel.deleteUserById({ user_id }, (err) => {
    if (err) {
      console.error("Admin deleteUser error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  });
};

module.exports.getAllChallenges = (req, res) => {
  adminModel.getAllChallenges((err, results) => {
    if (err) {
      console.error("Admin getAllChallenges error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.status(200).json(results);
  });
};

module.exports.deleteChallenge = (req, res) => {
  const challenge_id = parseInt(req.params.challenge_id);

  adminModel.deleteChallengeById({ challenge_id }, (err) => {
    if (err) {
      console.error("Admin deleteChallenge error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.status(200).json({ message: "Challenge deleted successfully" });
  });
};
