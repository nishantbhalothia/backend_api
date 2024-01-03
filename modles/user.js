const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true},
    phone: { type: String, required: true},
    password: { type: String, required: true },
}, { timestamps: true } );

// Hash password before saving to DB
userSchema.pre('save', async function (next) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});

// Generate JWT
userSchema.methods.generateAuthToken = async function () {
    try {
        const token = jwt.sign({ _id: this._id }, process.env.AUTH_TOKEN_SECRET, { expiresIn: '4h' });
        return token;
    } catch (error) {
        console.error(error);
    }
};
userSchema.methods.generateRefreshToken = async function () {
    try {
        const token = jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
        return token;
    } catch (error) {
        console.error(error);
    }
}

// Compare password
userSchema.methods.comparePassword = async function (password) {
    try {
        const isMatch = await bcrypt.compare(password, this.password);
        return isMatch;
    } catch (error) {
        console.error(error);
    }
};

module.exports = mongoose.model('User', userSchema);
