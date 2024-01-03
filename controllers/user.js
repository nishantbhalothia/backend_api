const User = require("../modles/user");

module.exports.create = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ message: "Not all fields have been entered." });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists." });
    }
    const newUser = new User({ name, email, phone, password });
    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Not all fields have been entered." });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }
    const authToken = await user.generateAuthToken();
    const refreshToken = await user.generateRefreshToken();
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/api/users/refreshToken",
    })
    .json({ authToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
