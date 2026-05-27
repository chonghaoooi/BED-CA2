//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
const express = require("express");
const router = express.Router();
const controller = require("../controllers/usersController");
const jwtMiddleware = require("../middlewares/jwtMiddleware");

router.get("/:user_id", jwtMiddleware.verifyToken, controller.ensureOwnUser, controller.readUserById);
router.put(
  "/:user_id",
  jwtMiddleware.verifyToken,
  controller.ensureOwnUser,
  controller.detectUsernameConflictForUpdate,
  controller.updateUserById
);
module.exports = router;
