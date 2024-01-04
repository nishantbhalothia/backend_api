const User = require("../modles/user");

module.exports = async (req, res, next) => {
  try {
    const { email, phone, password } = req.body;
    if (!email && !phone) {
      return res
        .status(400)
        .json({ message: "Not all fields have been entered." });
    }
    if (!password) {
      return res
        .status(400)
        .json({ message: "Not all fields have been entered." });
    }
    const user = await User.findOne({
      $or: [{ email: email }, { phone: phone }],
    });
    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }
    user.status = "active";
    const activeUser = await user.save(
      { validateBeforeSave: false },
      { new: true }
    );
    // console.log("activeUser", activeUser);
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
