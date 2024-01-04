const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        const token = req.cookies?.authToken || req.headers?.authorization?.split(" ")[1] || req.body?.authToken ;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized." });
        }
        const verified = jwt.verify(token, process.env.AUTH_TOKEN_SECRET);
        if (!verified) {
            return res.status(401).json({ message: "Unauthorized." });
        }
        console.log("verifiedUser",verified);
        req.user = verified;
        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};