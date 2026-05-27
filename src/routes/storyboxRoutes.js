//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
const express = require("express");
const router = express.Router();
const controller = require("../controllers/storyboxController");
const jwtMiddleware = require("../middlewares/jwtMiddleware");

router.post(
  "/open",
  jwtMiddleware.verifyToken,
  controller.verifyUserPoints,
  controller.getRandomClue,
  controller.insertUserInventory,
  controller.deductUserPoints,
  controller.returnClue
);

module.exports = router;
