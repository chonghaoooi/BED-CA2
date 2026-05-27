//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
const express = require("express");
const router = express.Router();
const controller = require("../controllers/challengesController");
const jwtMiddleware = require("../middlewares/jwtMiddleware");

router.post("/", jwtMiddleware.verifyToken, controller.postChallenges);
router.get("/", controller.readAllChallenges);
router.delete(
  "/:challenge_id",
  jwtMiddleware.verifyToken,
  controller.verifyChallengeOwnerForDelete,
  controller.deleteAllChallengeCompletions,
  controller.deleteChallengeById
);
router.put(
  "/:challenge_id",
  jwtMiddleware.verifyToken,
  controller.verifyChallengeOwner,
  controller.updateChallengeById
);
module.exports = router;
