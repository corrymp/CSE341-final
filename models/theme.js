const mongoose = require('mongoose');

module.exports = mongoose.model(
    'Theme',
    mongoose.Schema(
        {
            // theme name
            name: {
                type: String,
                required: true,
                minLength: 2,
                maxLength: 15,
                index: true
            },

            // theme description
            description: {
                type: String,
                maxLength: 127,
                required: true
            }
        },
        { versionKey: false }
    )
);
