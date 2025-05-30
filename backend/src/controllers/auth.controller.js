const { IsUserPresentUsingEmailService } = require('../services/user.service');
const { CheckEmailDomainIsPersonalOrNotUtil } = require('../utils/auth.utils');
const { IsOrganizationPresentUsingOrgDomainService, CreateNewOrganizationService } = require('../services/organization.service')
const { AuthBodyValidation } = require('../services/auth_body');

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
        await AuthBodyValidation(fullName, email, password);
        // ========================= 


        // ========= email checking via IsUserPresentUsingEmailService ========
        const IsUserPresentUsingEmailServiceResponse = await IsUserPresentUsingEmailService(email);
        if (IsUserPresentUsingEmailServiceResponse.success) {
            const err = new Error(`A user account associated with the provided email address already exists.`);
            err.statusCode = 400;
            throw err;
        }
        // ====================================================================


        // ======== Check if email domain is personal or not || CreateNewOrganizationService ========
        const emailDomain = email.split("@")[1]; // amanprajapati3205@gmail.com --> gmail.com
        const CheckEmailDomainIsPersonalOrNotUtilResponse = await CheckEmailDomainIsPersonalOrNotUtil(emailDomain);
        if (CheckEmailDomainIsPersonalOrNotUtilResponse.success) {
            return res.status(201).json({
                success: true,
                message: `Registration using personal email domains (like ${CheckEmailDomainIsPersonalOrNotUtilResponse.companyName}) is not allowed. Please use a work email.`,

            });
        }

        else {
            // If the email domain is not personal, we proceed to create or find the organization
            const organizationDomain = emailDomain; // aman.prajapati@lpu.in --> lpu.in
            const organizationName = organizationDomain.split(".")[0].toUpperCase(); // lpu.in --> LPU
            let organizationId;
            let organizationRole = "ORG_MEMBER";

            const IsOrganizationPresentUsingOrgDomainServiceResponse = await IsOrganizationPresentUsingOrgDomainService(organizationDomain);
            if (IsOrganizationPresentUsingOrgDomainServiceResponse.success) {
                organizationId = IsOrganizationPresentUsingOrgDomainServiceResponse.data._id;
            } else {
                const CreateNewOrganizationServiceResponse = await CreateNewOrganizationService(organizationDomain, organizationName);
                if (!CreateNewOrganizationServiceResponse.success) {
                    const err = new Error(`Unable to create organization for domain ${organizationDomain} and name ${organizationName}`);
                    err.statusCode = 500;
                    throw err;
                }

                organizationId = CreateNewOrganizationServiceResponse.data._id;
                organizationRole = "ORG_ADMIN";
            }
        }
        // =========================================================================





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