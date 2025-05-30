require('dotenv').config();
const jwt = require('jsonwebtoken');

const JWT_SECRET_KEY = process.env[`${process.env.NODE_ENV}_JWT_SECRET_KEY`] || process.env.JWT_SECRET_KEY;

if (!JWT_SECRET_KEY) {
    throw new Error('JWT_SECRET_KEY is not defined in environment variables');
}

const generateToken = (user) => {
    const payload = {
        userId: user._id,
        email: user.email,
        role: user.role // Will always be "user"
    };
    return jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '1d' }); // Token expires in 1 day
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET_KEY);
    } catch (error) {
        throw new Error(`Invalid or expired token: ${error.message}`);
    }
};

module.exports = {
    generateToken,
    verifyToken
};