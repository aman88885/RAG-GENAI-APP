const { IsUserPresentUsingEmailService } = require('../services/user.service');
const { CheckEmailDomainIsPersonalOrNotUtil } = require('../utils/auth.utils');
const { IsOrganizationPresentUsingOrgDomainService, CreateNewOrganizationService } = require('../services/organization.service');
const { AuthBodyValidation } = require('../services/auth_body');
const { generateToken } = require('../services/jwt.service');
const bcrypt = require('bcrypt');
const USERSModel = require('../models/users.model');

require('dotenv').config();

const SignupController = async (req, res) => {
    try {
        // Validate request body
        const { error, value } = AuthBodyValidation.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: `Validation error: ${error.details[0].message}`
            });
        }

        const { username, email, password } = value;

        // Check if user already exists
        const existingUser = await IsUserPresentUsingEmailService(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Check if email domain is valid (non-personal)
        const isPersonalEmail = await CheckEmailDomainIsPersonalOrNotUtil(email);
        if (isPersonalEmail) {
            return res.status(400).json({
                success: false,
                message: 'Please use a professional email address'
            });
        }

        // Check or create organization
        const domain = email.split('@')[1];
        let organization = await IsOrganizationPresentUsingOrgDomainService(domain);
        if (!organization) {
            organization = await CreateNewOrganizationService({ domain });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = await USERSModel.create({
            username,
            email,
            password: hashedPassword,
            role: 'user', // Explicitly set to user
            isActive: true
        });

        // Generate JWT
        const token = generateToken(newUser);

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                userId: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Error in SignupController:', error.message);
        return res.status(500).json({
            success: false,
            message: `Internal server error: ${error.message}`
        });
    }
};

const SigninController = async (req, res) => {
    try {
        // Validate request body
        const { error, value } = AuthBodyValidation.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: `Validation error: ${error.details[0].message}`
            });
        }

        const { email, password } = value;

        // Find user by email (select password explicitly)
        const user = await USERSModel.findOne({ email }).select('+password');
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or account is deactivated'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }

        // Generate JWT
        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: 'User signed in successfully',
            token,
            user: {
                userId: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Error in SigninController:', error.message);
        return res.status(500).json({
            success: false,
            message: `Internal server error: ${error.message}`
        });
    }
};

module.exports = {
    SignupController,
    SigninController
};