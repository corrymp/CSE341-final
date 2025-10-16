const { body, param } = require('express-validator');

module.exports = {
    create: () => [body('base_url').trim().escape().notEmpty().isLength({ min: 3, max: 15 }), body('title').trim().escape().notEmpty().isLength({ min: 3, max: 31 }), body('summary').trim().escape().notEmpty().isLength({ min: 0, max: 255 }), body('theme').trim().notEmpty().isMongoId(), body('open_at').optional().trim().notEmpty().isDate(), body('close_at').optional().trim().notEmpty().isDate()],
    update: () => [
        param('id').trim().notEmpty().isMongoId(),
        body('base_url').optional().trim().escape().notEmpty().isLength({ min: 3, max: 15 }),
        body('title').optional().trim().escape().notEmpty().isLength({ min: 3, max: 31 }),
        body('summary').optional().trim().escape().notEmpty().isLength({ min: 0, max: 255 }),
        body('theme').optional().trim().notEmpty().isMongoId(),
        body('open_at').optional().trim().notEmpty().isDate(),
        body('close_at').optional().trim().notEmpty().isDate(),

        // can not be assigned in POST as can't exist yet
        body('invalid_code').optional().trim().notEmpty().isMongoId()
    ]
};
