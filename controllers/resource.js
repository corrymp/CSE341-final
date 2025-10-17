const Resource = require('../models/resource');
const Campaign = require('../models/campaign');
const Code = require('../models/code');
const { cannedResponse, strs } = require('../utils');

// /campaign/{id}/resource POST => create campaign resource
async function postResource(req, res) {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) return cannedResponse.NotFound(res, strs.Campaign.Unknown);
        const raw = req.body.resource;

        const resource = new Resource({ home_campaign: campaign._id, resource: typeof raw !== 'object' ? JSON.parse(raw) : raw });
        await resource.save();
        cannedResponse.Created(res, { id: resource._id });
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

// /campaign/{id}/resource GET => read all campaign resource
async function getResources(req, res) {
    try {
        const resources = await Resource.find({ home_campaign: req.params.id });
        cannedResponse.OK(res, { resources });
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

// /campaign/{id}/resource/{id2} GET => read campaign resource
async function getResource(req, res) {
    try {
        const resource = await Resource.findOne({ _id: req.params.id2, home_campaign: req.params.id });
        if (!resource) return cannedResponse.NotFound(res, strs.Resource.Unknown);
        cannedResponse.OK(res, { resource });
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

// /campaign/{id}/resource/{id2} PUT => update campaign resource
async function putResource(req, res) {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) return cannedResponse.NotFound(res, strs.Campaign.Unknown);
        const resource = await Resource.findById(req.params.id2);
        if (!resource) return cannedResponse.NotFound(res, strs.Resource.Unknown);
        if (req.body.home_campaign && !campaign._id.equals(req.body.home_campaign)) return cannedResponse.NotAcceptable(res, strs.Resource.UpdateHomeCampaign);
        resource.resource = req.body.resource ?? resource.resource;
        await resource.save();
        cannedResponse.OK(res, strs.Resource.Updated);
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

// /campaign/{id}/resource/{id2} DELETE => delete campaign resource
async function deleteResource(req, res) {
    try {
        const campaign = await Campaign.findById(req.params.id).lean();
        if (!campaign) return cannedResponse.NotFound(res, strs.Campaign.Unknown);
        const resource = await Resource.findById(req.params.id2);
        if (!resource) return cannedResponse.NotFound(res, strs.Resource.Unknown);
        if (campaign.invalid_code?.equals(resource._id)) return cannedResponse.Conflict(res, strs.Resource.UsedByCampaign);
        const codes = await Code.find({ target_resource: resource._id }).lean();
        if (codes.length) return cannedResponse.Conflict(res, strs.Resource.UsedByCode);
        await resource.deleteOne();
        cannedResponse.Gone(res, strs.Resource.Deleted);
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

module.exports = {
    getResources,
    getResource,
    postResource,
    putResource,
    deleteResource
};
