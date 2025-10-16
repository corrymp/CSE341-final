const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
module.exports = mongoose.model(
    'Campaign',
    mongoose.Schema(
        {
            // PUBLIC //

            // URL part used in conjuction with codes to access ARG resources
            base_url: {
                type: String,
                required: true,
                minLength: 3,
                maxLength: 15,
                index: true
            },

            // title of campaign
            title: {
                type: String,
                required: true,
                minLength: 3,
                maxLength: 31
            },

            // summary of campaign
            summary: {
                type: String,
                required: true,
                maxLength: 255
            },

            // primary theme of campaign
            theme: {
                type: ObjectId,
                required: true,
                ref: 'Theme'
            },

            // HIDDEN //

            // fallback resource when invalid codes are entered - optional
            invalid_code: {
                type: ObjectId,
                ref: 'Resource'
            },

            // time the campaign goes public and shuts down
            open_at: Date,
            close_at: Date
        },
        { versionKey: false }
    )
);
