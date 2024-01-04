const User = require("../modles/user");
const bcrypt = require('bcryptjs');

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
    console.log("userController_login Body : ", req.body);
  try {
    const { email, phone, password, } = req.body;
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

    console.log("userController_login user : ", user);
    
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
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized." });
    }
    const logoutUser= await User.findByIdAndUpdate(user, { refreshToken: "" }, { new: true });

    res.cookie("refreshToken", "", { httpOnly: true, secure: true, path: "/api/users/refreshToken" })
    .status(200)
    .json({ message: "User logged out." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.changeStatus = async (req, res) => {
  try {
    const deactivateUser = await User.findByIdAndUpdate(req.user, { status: "deactivated" }, { new: true });
    res
        .cookie("refreshToken", "", { httpOnly: true, secure: true, path: "/api/users/refreshToken" })
        .json(deactivateUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user);
    res
        .cookie("refreshToken", "", { httpOnly: true, secure: true, path: "/api/users/refreshToken" })
        .json(deletedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// here we are assuming that user is already logged in
module.exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name && !email && !phone && !password) {
      return res
        .status(400)
        .json({ message: "Input fields are empty" });
    }

    const user = await User.findById(req.user);
    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }
    if (password) {
      const isMatch = await user.comparePassword(password);
      if (isMatch) {
        return res.status(400).json({ message: "New password must be different from current password" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }
    if (name) {
      user.name = name;
    }
    if (email) {
      user.email = email;
    }
    if (phone) {
      user.phone = phone;
    }
    const updatedUser = await user.save();
    res
      .status(200)
      .json(updatedUser);
  } catch (error) {
    // res.status(500).json({ error: error.message });
    if (error.code === 11000) {
      const duplicatedFieldMatch = error.message.match(/index: (\w*)_1/);
      const duplicatedField = duplicatedFieldMatch ? duplicatedFieldMatch[1] : null;

      if (duplicatedField) {
          res.status(400).json({ error: `${duplicatedField.charAt(0).toUpperCase() + duplicatedField.slice(1)} already exists.` });
      } else {
          res.status(400).json({ error: "Duplicate key error." });
      }
  } else {
      res.status(500).json({ error: error.message });
  }
  }
};