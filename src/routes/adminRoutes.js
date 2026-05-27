const express = require("express");
const router = express.Router();
const jwtMiddleware = require("../middlewares/jwtMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const adminController = require("../controllers/adminController");

// All admin routes require valid JWT + admin check
router.use(jwtMiddleware.verifyToken, adminMiddleware.requireAdmin);

router.get("/users", adminController.getAllUsers);
router.delete("/users/:user_id", adminController.deleteUser);

router.get("/challenges", adminController.getAllChallenges);
router.delete("/challenges/:challenge_id", adminController.deleteChallenge);

module.exports = router;
