require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/users.model');

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

if (!JWT_SECRET_KEY) {
    console.error('JWT_SECRET_KEY is not configured in .env');
    process.exit(1);
}

// Helper to generate JWT token
const generateToken = (userId, email, role) => {
    return jwt.sign(
        {   
            userId: userId.toString(),
            email,
            role 
        },
        JWT_SECRET_KEY,
        { expiresIn: '24h' }
    );
};

// Validate email format
const isValidEmail = (email) => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    return emailRegex.test(email);
};

// Validate password strength
const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
    return passwordRegex.test(password);
};

const SignupController = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName?.trim()) {
            return res.status(400).json({ success: false, message: "Full name is required" });
        }

        if (fullName.trim().length < 3 || fullName.trim().length > 50) {
            return res.status(400).json({ success: false, message: "Full name must be between 3 and 50 characters" });
        }

        if (!email?.trim()) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        if (!isValidEmail(email.trim())) {
            return res.status(400).json({ success: false, message: "Please provide a valid email address" });
        }

        if (!password) {
            return res.status(400).json({ success: false, message: "Password is required" });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long and contain at least one letter and one number"
            });
        }

        // Check if user exists (case-insensitive fullName check)
        const existingUser = await UserModel.findOne({
            $or: [
                { email: email.trim().toLowerCase() },
                { fullName: new RegExp(`^${fullName.trim()}$`, 'i') }
            ]
        });

        if (existingUser) {
            if (existingUser.email === email.trim().toLowerCase()) {
                return res.status(409).json({ success: false, message: "User with this email already exists" });
            } else {
                return res.status(409).json({ success: false, message: "User with this full name already exists" });
            }
        }

        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new UserModel({
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword
        });

        await newUser.save();

        const token = generateToken(newUser._id, newUser.email, newUser.role);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                role: newUser.role,
                isActive: newUser.isActive,
                createdAt: newUser.createdAt
            },
            token
        });

    } catch (error) {
        console.error('Signup error:', error);

        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(409).json({
                success: false,
                message: `User with this ${field} already exists`
            });
        }

        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: validationErrors.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error during signup"
        });
    }
};

const SigninController = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email?.trim()) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        if (!isValidEmail(email.trim())) {
            return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
        }

        if (!password) {
            return res.status(400).json({ success: false, message: 'Password is required' });
        }

        const user = await UserModel.findOne({ email: email.trim().toLowerCase() }).select('+password');

        // Combine checks to avoid info leak
        if (!user || !user.isActive || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const token = generateToken(user._id, user.email, user.role);

        // Optionally update last login
        user.updatedAt = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: "Sign in successful",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            },
            token
        });

    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error during signin"
        });
    }
};

const LogoutController = async (req, res) => {
    try {
        // For stateless JWT, logout is frontend job or token blacklist implementation
        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: "Error during logout"
        });
    }
};

const GetProfileController = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId);

        if (!user || !user.isActive) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching user profile"
        });
    }
};

module.exports = {
    SignupController,
    SigninController,
    LogoutController,
    GetProfileController
};
