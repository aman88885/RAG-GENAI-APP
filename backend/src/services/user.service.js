const USERSModel = require('../models/users.model');

const IsUserPresentUsingEmailService = async (email) => {
    try {
        const emailCheck = await USERSModel.findOne({ email }).exec();

        if (emailCheck) {
            return {
                success: true,
                data: emailCheck
            };
        } else {
            return {
                success: false,
                message: "User not found"
            };
        }
    } catch (error) {
        console.error("Error in IsUserPresentUsingEmailService:", error);
        return {
            success: false,
            message: "Error in IsUserPresentUsingEmailService",
            error
        };
    }
};

module.exports = {
    IsUserPresentUsingEmailService
};
