const Campaign = require('../models/campaign');
const Theme = require('../models/theme');
const Resource = require('../models/resource');
const Code = require('../models/code');
const Manager = require('../models/manager');
const { cannedResponse, strs } = require('../utils');

// /campaign POST => create campaign
async function postCampaign(req, res) {
    try {
        const theme = await Theme.findById(req.body.theme);
        if (!theme) return cannedResponse.NotFound(res, strs.Theme.Unknown);

        const { base_url, title, summary, open_at, close_at } = req.body;

        const newCampaign = new Campaign({ base_url, title, summary, theme: theme._id, open_at, close_at });
        const manager = new Manager({ user: res.locals.account._id, campaign: newCampaign._id });

        await newCampaign.save();
        await manager.save();

        cannedResponse.Created(res, { id: newCampaign._id });
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

// /campaign GET => read all campaigns
async function getCampaigns(req, res) {
    try {
        const campaigns = await Campaign.find();
        cannedResponse.OK(res, { campaigns });
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

// /campaign/{id} GET => read campaign
async function getCampaign(req, res) {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) return cannedResponse.NotFound(res, strs.Campaign.Unknown);
        cannedResponse.OK(res, { campaign });
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

// /campaign/{id} PUT => update campaign
async function putCampaign(req, res) {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) return cannedResponse.NotFound(res, strs.Campaign.Unknown);

        const invalid_code = req.body.invalid_code;
        if (invalid_code && !(await Resource.findById(invalid_code))) return cannedResponse.NotFound(res, strs.Resource.Unknown);

        ['base_url', 'title', 'summary', 'theme', 'open_at', 'close_at', 'invalid_code'].forEach(k => (campaign[k] = req.body[k] ?? campaign[k]));

        await campaign.save();
        cannedResponse.OK(res, strs.Campaign.Updated);
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

// /campaign/{id} DELETE => delete campaign
async function deleteCampaign(req, res) {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) return cannedResponse.NotFound(res, strs.Campaign.Unknown);
        await Code.deleteMany({ home_campaign: campaign._id });
        await Resource.deleteMany({ home_campaign: campaign._id });
        await Manager.deleteMany({ campaign: campaign._id });
        await campaign.deleteOne();
        cannedResponse.Gone(res, strs.Campaign.Deleted);
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

module.exports = {
    postCampaign,
    getCampaigns,
    getCampaign,
    putCampaign,
    deleteCampaign
};
