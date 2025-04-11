


// ==================== Load Modules ====================
require('dotenv').config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// =====================================================

const SignupController = async (req, res) => {
    try {

        const { fullName, email, password } = req.body;

        // ======= Validation ======
        if(!fullName){
            const err = new Error("Full name is requires");
            err.statusCode = 400;
            throw err;
        };     
        if(!email){
            const err = new Error("Full name is requires");
            err.statusCode = 400;
            throw err;
        };     
        if(!password){
            const err = new Error("Full name is requires");
            err.statusCode = 400;
            throw err;
        };  
        // ========================= 

        
        

    } catch (error) {
        
    }
};

const SigninController = async (req, res) => {
    try {
        
    } catch (error) {
                
    }
};

module.exports = {
    SignupController,
    SigninController
};