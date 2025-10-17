const { body, param } = require('express-validator');
const UserTypes = require('../utils').UserTypes;

const normalizeJSONToString = val => (typeof val !== 'object' ? val : JSON.stringify(val));
const nowMakeItJSONAgain = val => JSON.parse(val);

module.exports = {
    create: () => [body('type').optional().trim().notEmpty().isIn(Object.values(UserTypes)), body('account').optional().customSanitizer(normalizeJSONToString).isJSON({ allow_primitives: true }).customSanitizer(nowMakeItJSONAgain)],
    update: () => [param('id').trim().notEmpty().isMongoId(), body('type').optional().trim().notEmpty().isIn(Object.values(UserTypes)), body('account').optional().customSanitizer(normalizeJSONToString).isJSON({ allow_primitives: true }).customSanitizer(nowMakeItJSONAgain)]
};
