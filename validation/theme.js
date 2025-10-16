const { body, param } = require('express-validator');

module.exports = {
    create: () => [body('name').trim().escape().notEmpty().isLength({ min: 1, max: 31 }), body('description').trim().escape().notEmpty().isLength({ min: 1, max: 127 })],
    update: () => [param('id').trim().notEmpty().isMongoId(), body('name').optional().trim().escape().notEmpty().isLength({ min: 1, max: 31 }), body('description').optional().trim().escape().notEmpty().isLength({ min: 1, max: 127 })]
};
