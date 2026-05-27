//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
const express = require("express");
const router = express.Router();
const controller = require("../controllers/accusationController");
const jwtMiddleware = require("../middlewares/jwtMiddleware");

router.post(
  "/",
  jwtMiddleware.verifyToken,
  controller.verifyUserExists,
  controller.verifySuspectExists,
  controller.preventDuplicateAccusation,
  controller.insertAccusation,
  controller.insertUserEnding,
  controller.returnEnding
);

module.exports = router;
