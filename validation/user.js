const { body, param } = require('express-validator');
const UserTypes = require('../utils').UserTypes;

module.exports = {
    create: () => [body('type').trim().notEmpty().isIn(Object.values(UserTypes)), body('account').notEmpty().isJSON()],
    update: () => [param('id').trim().notEmpty().isMongoId(), body('type').optional().trim().notEmpty().isIn(Object.values(UserTypes)), body('account').optional().notEmpty().isJSON()]
};
