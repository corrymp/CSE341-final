const router = require('express').Router();
const validator = require('../utils').validator;
const code = require('../controllers/code');
const codeValidator = require('../validation/code');

router.post('/:id/code', codeValidator.create(), validator, code.postCode); // /campaign/{id}/code POST => create campaign code

router.get('/:id/code', validator.path(), validator, code.getCodes); // /campaign/{id}/code GET => read all campaign code

router.get('/:id/code/:idOrCode', validator.path(), validator, code.getCode); // /campaign/{id}/code/{id2|code} GET => read campaign code

router.put('/:id/code/:id2', codeValidator.update(), validator, code.putCode); // /campaign/{id}/code/{id2} PUT => update campaign code

router.delete('/:id/code/:id2', validator.path(), validator, code.deleteCode); // /campaign/{id}/code/{id2} DEL => delete campaign code

module.exports = router;
