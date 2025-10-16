const router = require('express').Router();
const validator = require('../utils').validator;
const resource = require('../controllers/resource');
const resourceValidator = require('../validation/resource');

router.post('/:id/resource/', resourceValidator.create(), validator, resource.postResource); // /campaign/{id}/resource POST => create campaign resource

router.get('/:id/resource/', validator.path(), validator, resource.getResources); // /campaign/{id}/resource GET => read all campaign resources

router.get('/:id/resource/:id2', validator.path(), validator, resource.getResource); // /campaign/{id}/resource/{id2} GET => read campaign resource

router.put('/:id/resource/:id2', resourceValidator.update(), resource.putResource); // /campaign/{id}/resource/{id2} PUT => update campaign resource

router.delete('/:id/resource/:id2', validator.path(), validator, resource.deleteResource); // /campaign/{id}/resource/{id2} DEL => delete campaign resource

module.exports = router;
