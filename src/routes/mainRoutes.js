//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
//////////////////////////////////////////////////////
// REQUIRE MODULES
//////////////////////////////////////////////////////
const express = require("express");
//////////////////////////////////////////////////////
// CREATE ROUTER
//////////////////////////////////////////////////////
const router = express.Router();
const jwtMiddleware = require("../middlewares/jwtMiddleware");
const bcryptMiddleware = require("../middlewares/bcryptMiddleware");
const userLoginController = require("../controllers/userLoginController");
const usersRoutes = require("./usersRoutes");
const userController = require("../controllers/usersController");
const challengesRoutes = require("./challengesRoutes");
const userCompletionRoutes = require("./userCompletionRoutes");
const storyboxRoutes = require("./storyboxRoutes");
const inventoryRoutes = require("./inventoryRoutes");
const itemsRoutes = require("./itemsRoutes");
const suspectsRoutes = require("./suspectsRoutes");
const accusationRoutes = require("./accusationRoutes");
const endingRoutes = require("./endingRoutes");
const progressRoutes = require("./progressRoutes");
const leaderboardRoutes = require("./leaderboardRoutes");
const adminRoutes = require("./adminRoutes");

//////////////////////////////////////////////////////
// DEFINE ROUTES
//////////////////////////////////////////////////////
router.post(
  "/login",
  userLoginController.login,
  bcryptMiddleware.comparePassword,
  jwtMiddleware.generateToken,
  jwtMiddleware.sendToken
);
router.post(
  "/register",
  userLoginController.checkUsernameOrEmailExist,
  bcryptMiddleware.hashPassword,
  userLoginController.register,
  userController.createNewUser,
  jwtMiddleware.generateToken,
  jwtMiddleware.sendToken,
);
router.use("/users", usersRoutes);
router.use("/challenges", challengesRoutes, userCompletionRoutes);
router.use("/storybox", storyboxRoutes);

router.use("/inventory", inventoryRoutes);
router.use("/items", itemsRoutes);

router.use("/suspects", suspectsRoutes);

router.use("/accusation", accusationRoutes);
router.use("/ending", endingRoutes);

router.use("/progress", progressRoutes);

router.use("/leaderboard", leaderboardRoutes);
router.use("/admin", adminRoutes);
//////////////////////////////////////////////////////
// EXPORT ROUTER
//////////////////////////////////////////////////////
module.exports = router;
