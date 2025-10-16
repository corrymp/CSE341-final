const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

module.exports = mongoose.model(
    'Code',
    mongoose.Schema(
        {
            // code used with the home campaign base_url to access resources
            code: {
                type: String,
                required: true,
                minLength: 1,
                maxLength: 31,
                index: true
            },

            // resource the code points to
            target_resource: {
                type: ObjectId,
                ref: 'Resource',
                required: true
            },

            // campaign code is associated with
            home_campaign: {
                type: ObjectId,
                ref: 'Campaign',
                required: true
            },

            // times after which the code may be and may no longer be used
            valid_after: Date,
            valid_until: Date
        },
        { versionKey: false }
    )
);
