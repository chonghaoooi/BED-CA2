//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
const express = require("express");
const router = express.Router();
const controller = require("../controllers/itemsController");
const jwtMiddleware = require("../middlewares/jwtMiddleware");

router.get("/", jwtMiddleware.verifyToken, controller.readAllItems);
module.exports = router;
