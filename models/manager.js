const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

module.exports = mongoose.model(
    'Manager',
    mongoose.Schema(
        {
            // user
            user: {
                type: ObjectId,
                ref: 'User',
                required: true,
                index: true
            },

            // campaign
            campaign: {
                type: ObjectId,
                ref: 'Campaign',
                required: true,
                index: true
            }
        },
        { versionKey: false }
    )
);
