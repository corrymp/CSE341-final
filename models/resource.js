const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

module.exports = mongoose.model(
    'Resource',
    mongoose.Schema(
        {
            // campaign resource is linked to
            home_campaign: {
                type: ObjectId,
                ref: 'Campaign'
            },

            // JSON object containing resource data
            resource: {
                type: Object,
                required: true
            }
        },
        { versionKey: false }
    )
);
