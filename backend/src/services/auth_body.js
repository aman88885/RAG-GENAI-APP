

const AuthBodyValidation = async (fullName, email, password) => {
    if (!fullName) {
        const err = new Error("Full name is required in body");
        err.statusCode = 400;
        throw err;
    }
    if (!email) {
        const err = new Error("Email is required in body");
        err.statusCode = 400;
        throw err;
    }
    if (!password) {
        const err = new Error("Password is required in body"); // ✅ fixed
        err.statusCode = 400;
        throw err;
    }
};

module.exports = {
    AuthBodyValidation
};
