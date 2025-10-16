const mongoose = require('mongoose');

module.exports = mongoose.model(
    'User',
    mongoose.Schema(
        {
            // user account data
            account: {
                type: Object,
                required: true
            },

            // mre readable unique identifier than oId
            ident: {
                type: String,
                required: true,
                index: true
            },

            // user type
            type: {
                type: String,
                enum: ['VIEWER', 'ORGANIZER', 'ADMIN'],
                default: 'VIEWER'
            }
        },
        { versionKey: false }
    )
);
