const router = require('express').Router();
const lookup = require('../controllers/lookup');
const validator = require('../utils').validator;

// /{campaignBaseUrl}/{code} GET => read campaign resource
router.get('/:baseUrl/:code', validator.path(), validator, lookup.resourcePage);

// /{campaignBaseUrl} GET => read campaign details
router.get('/:baseUrl', validator.path(), validator, lookup.detailsPage);

module.exports = router;
