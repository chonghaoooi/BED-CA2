//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
const express = require("express");
const router = express.Router();
const controller = require("../controllers/userCompletionController");
const jwtMiddleware = require("../middlewares/jwtMiddleware");

router.post(
  "/:challenge_id",
  jwtMiddleware.verifyToken,
  controller.verifyChallengeId,
  controller.verifyUserExists,
  controller.postChallengeCompletionById,
  controller.updateUserPoints
);
router.get("/:challenge_id", controller.getCompletedChallengeById);

module.exports = router;
