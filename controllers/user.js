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
    console.log("userController_login", req.body);
  try {
    const { email, password, phone } = req.body;
    if ((!email || !phone) && !password) {
      return res
        .status(400)
        .json({ message: "Not all fields have been entered." });
    }
    const user = await User.findOne({
        $or: [
            { email: email },
            { phone: phone },
        ]
    });

    console.log("userController_login", user);
    
    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }
    const authToken = await user.generateAuthToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false});

    console.log("refreshToken : ", refreshToken, " ","authToken : ", authToken);

    return res.
    cookie("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/api/users/refreshToken",
    })
    .json({ authToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.refreshToken = async (req, res) => {
    console.log("userController_refreshToken", req.body);
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken || req.headers?.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized." });
    }
    const verified = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    if (!verified) {
      return res.status(401).json({ message: "Unauthorized." });
    }
    const user = await User.findById(verified._id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized." });
    }
    const authToken = await user.generateAuthToken();
    res.json({ authToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports.logout = async (req, res) => {
  try {
    res.cookie("refreshToken", "", { httpOnly: true, secure: true, path: "/api/users/refreshToken" })
    .json({ message: "Logged out." });
    return res.redirect("/");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndUpdate(req.user, { status: "sleep" }, { new: true });
    res
        .cookie("refreshToken", "", { httpOnly: true, secure: true, path: "/api/users/refreshToken" })
        .json(deletedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
