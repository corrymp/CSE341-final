const { body, param } = require('express-validator');

const normalizeJSONToString = val => typeof val !== 'object' ? val : JSON.stringify(val);
const nowMakeItJSONAgain = val => JSON.parse(val);

module.exports = {
    create: () => [param('id').trim().notEmpty().isMongoId(), body('resource').customSanitizer(normalizeJSONToString).isJSON({ allow_primitives: true }).customSanitizer(nowMakeItJSONAgain)],
    update: () => [
        param('id').trim().notEmpty().isMongoId(),
        param('id2').trim().notEmpty().isMongoId(),

        // still required as it's the only thing that CAN be changed
        body('resource').customSanitizer(normalizeJSONToString).isJSON({ allow_primitives: true }).customSanitizer(nowMakeItJSONAgain)
    ]
};
