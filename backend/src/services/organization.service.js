const ORGANIZATIONSModel = require('../models/organization.model');

const IsOrganizationPresentUsingOrgDomainService = async (organizationDomain) => {
    try {
        const organization = await ORGANIZATIONSModel.findOne({ domain: organizationDomain }).exec();

        if (organization) {
            return {
                success: true,
                data: organization
            };
        } else {
            return {
                success: false,
                message: `Organization not found with domain: ${organizationDomain}`
            };
        }
    } catch (error) {
        console.error("Error in IsOrganizationPresentUsingOrgDomainService:", error);
        return {
            success: false,
            message: "Error in IsOrganizationPresentUsingOrgDomainService",
            error: error.message || error
        };
    }
};

const CreateNewOrganizationService = async (organizationDomain, organizationName) => {
    try {
        const organizationDetails = {
            name: organizationName  // { name: 'LPU' }
        }

        if (organizationDomain) {
            organizationDetails.domain = organizationDomain  // { name: 'LPU', domain: 'lpu.in' }
        }

        const organization = await ORGANIZATIONSModel.create(organizationDetails);

        if (organization) {
            return {
                success: true,
                data: organization
            }
        }else{
            throw new Error(`Unable to create organization for name ${organizationName}`);
        }

    } catch (error) {
        console.log("Error in CreateNewOrganizationService:", error);
        return {
            success: false
        }
    };

};

module.exports = {
    IsOrganizationPresentUsingOrgDomainService,
    CreateNewOrganizationService
};
