const express = require("express");
const router = express.Router();

const createUser = require("../../controllers/user");
const isAuth = require("../../middlewares/user_auth");

// All routes
router.get("/", (req, res) => {
  res.send("welcome to user route");
});

router.post("/register",createUser.create);
router.get("/login", createUser.login);
router.get("/logout", isAuth, createUser.logout);
router.post("/refreshToken", createUser.refreshToken);
// router.post("/updateuser", createUser.updateUser);
router.post("/deleteuser", isAuth,createUser.deleteUser);



module.exports = router;
