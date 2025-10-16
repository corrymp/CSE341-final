const router = require('express').Router();
const campaign = require('../controllers/campaign');
const campaignValidator = require('../validation/campaign');
const { requiresAuth } = require('express-openid-connect');
const { requiredPermissionLevel, validator } = require('../utils');

// req.params breaks if I have part if them in here and part in there
// no add. auth, some admin only
router.use(require('./code'));
// no add. auth
router.use(require('./resource'));
router.use(require('./manager'));

router.post('/', requiresAuth(), requiredPermissionLevel('ORGANIZER'), campaignValidator.create(), validator, campaign.postCampaign); // /campaign POST => create campaign

router.get('/', requiresAuth(), requiredPermissionLevel('ORGANIZER'), campaign.getCampaigns); // /campaign GET => read all campaigns

router.get('/:id', requiresAuth(), requiredPermissionLevel('ORGANIZER'), validator.path(), validator, campaign.getCampaign); // /campaign/{id} GET => read campaign

router.put('/:id', requiresAuth(), requiredPermissionLevel('ORGANIZER'), campaignValidator.update(), validator, campaign.putCampaign); // /campaign/{id} PUT => update campaign

router.delete('/:id', requiresAuth(), requiredPermissionLevel('ORGANIZER'), validator.path(), validator, campaign.deleteCampaign); // /campaign/{id} DEL => delete campaign

module.exports = router;
