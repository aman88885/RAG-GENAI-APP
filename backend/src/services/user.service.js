const USERSModel = require('../models/users.model');

const IsUserPresentUsingEmailService = async (email) => {
    try {

        if (!email || typeof email !== 'string' || !email.includes('@')) {
            throw new Error('Invalid email format');
        }

        const user = await USERSModel.findOne({ email }).exec();

        if (user) {
            return {
                success: true,
                data: user.toObject() // Convert Mongoose document to plain object
            }
        } else {
            throw new Error(`User with email ${email} not found`);
        }

    } catch (err) {
        console.error(`Error in IsUserPresentUsingEmailService: ${err.message}`, { email });
        return {
            success: false,
            error: err.message
        };
    }
}
module.exports = {
    IsUserPresentUsingEmailService
};
