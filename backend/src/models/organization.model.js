const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    domain: {
        type: String,
        trim: true
    },
    isFreeAccount: {
        type: Boolean,
        default: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    location: {
        type: String,
        trim: true
    },
    lastPaymentAt: {
        type: Date
    }
}, { timestamps: true });

const ORGANIZATIONSModel = mongoose.model('organizations', OrganizationSchema);

module.exports = ORGANIZATIONSModel;
