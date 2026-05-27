//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
const express = require("express");
const router = express.Router();
const controller = require("../controllers/inventoryController");
const jwtMiddleware = require("../middlewares/jwtMiddleware");

router.get("/:user_id", jwtMiddleware.verifyToken, controller.getUserInventory);
router.delete("/:user_id", jwtMiddleware.verifyToken, controller.resetUserInventory);
module.exports = router;
