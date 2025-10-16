const Campaign = require('../models/campaign');
const Code = require('../models/code');
const Resource = require('../models/resource');
const { cannedResponse, sanitizeCampaigns } = require('../utils');

/**
 * @param {Number|undefined} lower - lower bounds to check. Check fails if `undefined` 
 * @param {Number} subject - the item being checked
 * @param {Number|undefined} upper - upper bounds to check. Sets to a number bigger than `subject` if `undefined`
 */
const validRange = (lower, subject, upper) => lower && lower < subject && subject < (upper ?? subject + 1);

async function getCampaignOrNotFound(base_url, res) {
    try {
        const campaign = await Campaign.findOne({ base_url }).lean();
        if (!campaign) return cannedResponse.NotFound(res), null;
        if (!validRange(campaign.open_at && Date.parse(campaign.open_at), Date.now(), campaign.close_at && Date.parse(campaign.close_at))) return cannedResponse.NotFound(res), null;
        return campaign;
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

async function detailsPage(req, res) {
    try {
        const campaign = await getCampaignOrNotFound(req.params.baseUrl, res);
        if (!campaign) return;
        cannedResponse.OK(res, sanitizeCampaigns([campaign])[0]);
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

async function resourcePage(req, res) {
    try {
        const campaign = await getCampaignOrNotFound(req.params.baseUrl, res);
        if (!campaign) return;

        const codeDoc = await Code.findOne({ home_campaign: campaign._id, code: req.params.code });
        if (codeDoc && validRange(codeDoc.valid_after && Date.parse(codeDoc.valid_after), Date.now(), codeDoc.valid_before && Date.parse(codeDoc.valid_until))) return cannedResponse.OK(res, (await Resource.findById(codeDoc.target_resource).lean()).resource);

        // fallback to invalid code resource
        const invalid_code = await Resource.findById(campaign.invalid_code).lean();
        if (invalid_code) return cannedResponse.OK(res, invalid_code.resource);

        // fallback to details page
        return cannedResponse.OK(res, sanitizeCampaigns([campaign])[0]);
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

module.exports = { detailsPage, resourcePage };
