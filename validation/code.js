const { body, param } = require('express-validator');

module.exports = {
    create: () => [param('id').trim().notEmpty().isMongoId(), body('code').trim().escape().notEmpty().isLength({ min: 1, max: 31 }), body('target_resource').trim().notEmpty().isMongoId(), body('valid_after').optional().trim().notEmpty().isDate(), body('valid_until').optional().trim().notEmpty().isDate()],
    update: () => [param('id').trim().notEmpty().isMongoId(), param('id2').trim().notEmpty().isMongoId(), body('code').optional().trim().escape().notEmpty().isLength({ min: 1, max: 31 }), body('target_resource').optional().trim().notEmpty().isMongoId(), body('valid_after').optional().trim().notEmpty().isDate(), body('valid_until').optional().trim().notEmpty().isDate()]
};
