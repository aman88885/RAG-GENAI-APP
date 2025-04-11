
const USERSModel = require('./../models/users.model');


const IsUserPresentUsingEmailService = async () => {
    try {
        const emailCheck = await USERSModel.findOne({ "email": email }).exec();

        if (emailCheck) {
            return {
                success: true,
                data: emailCheck
            }
        } else {
            return {
                success: false,
                message: "User not found"
            }
        }
    } catch (error) {
        console.log("Error in IsUserPresentUsingEmailService", error);
        return {
            success: false,
            message: "Error in IsUserPresentUsingEmailService",
            error: error
        }
    }
}

module.exports = {
    IsUserPresentUsingEmailService
}