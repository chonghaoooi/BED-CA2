//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
const express = require("express");
const router = express.Router();
const controller = require("../controllers/progressController");
const jwtMiddleware = require("../middlewares/jwtMiddleware");

router.get("/:user_id", jwtMiddleware.verifyToken, controller.getUserProgress);

module.exports = router;
