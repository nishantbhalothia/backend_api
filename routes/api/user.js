const express = require("express");
const router = express.Router();

const createUser = require("../../controllers/user");

// All routes
router.get("/", (req, res) => {
  res.send("welcome to user route");
});

router.post("/register",createUser.create);

module.exports = router;
