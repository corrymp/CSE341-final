const Code = require('../models/code');
const Campaign = require('../models/campaign');
const Resource = require('../models/resource');
const { cannedResponse, resolveToIdOrName, strs } = require('../utils');

// /campaign/{id}/code POST => create campaign code
async function postCode(req, res) {
    try {
        const home_campaign = req.params.id;
        const campaign = await Campaign.findById(home_campaign);
        if (!campaign) return cannedResponse.NotFound(res, strs.Campaign.Unknown);

        const target_resource = req.body.target_resource;
        const resource = await Resource.findById(target_resource);
        if (!resource) return cannedResponse.NotFound(res, strs.Resource.Unknown);

        const code = req.body.code;
        const valid_after = req.body.valid_after;
        const valid_until = req.body.valid_until;

        const newCode = new Code({ code, target_resource, home_campaign, valid_after, valid_until });
        await newCode.save();

        cannedResponse.Created(res, { id: newCode._id });
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

// /campaign/{id}/code GET => read all campaign code
async function getCodes(req, res) {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) return cannedResponse.NotFound(res, strs.Campaign.Unknown);
        const codes = await Code.find({ home_campaign: campaign._id });
        cannedResponse.OK(res, { codes });
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

// /campaign/{id}/code/{id2|code} GET => read campaign code
async function getCode(req, res) {
    try {
        const campaignId = req.params.id;
        if (!(await Campaign.findById(campaignId))) return cannedResponse.NotFound(res, strs.Campaign.Unknown);
        const idOrCode = await resolveToIdOrName(req.params.idOrCode, Code, 'code');
        if (!idOrCode.result) return cannedResponse.NotFound(res, strs.Code.Unknown);
        const code = await Code.findById(idOrCode.id);
        cannedResponse.OK(res, { code });
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

// /campaign/{id}/code/{id2} PUT => update campaign code
async function putCode(req, res) {
    try {
        if (!(await Campaign.findById(req.params.id))) return cannedResponse.NotFound(res, strs.Campaign.Unknown);

        const existingCode = await Code.findById(req.params.id2);
        if (!existingCode) return cannedResponse.NotFound(res, strs.Code.Unknown);

        const target_resource = req.body.target_resource;
        if (target_resource && !(await Resource.findById(target_resource))) return cannedResponse.NotFound(res, strs.Resource.Unknown);

        if (req.body.home_campaign) return cannedResponse.Forbidden(res, strs.Code.UpdateHomeCampaign);

        //TODO: check that this works
        ['code', 'target_resource', 'valid_after', 'valid_until'].forEach(k => (existingCode[k] = req.body[k] ?? existingCode[k]));
        // existingCode.code = req.body.code ?? existingCode.code;
        // existingCode.target_resource = target_resource ?? existingCode.target_resource;
        // existingCode.valid_after = req.body.valid_after ?? existingCode.valid_after;
        // existingCode.valid_until = req.body.valid_until ?? existingCode.valid_until;

        await existingCode.save();
        cannedResponse.OK(res, strs.Code.Updated);
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

// /campaign/{id}/code/{id2} DELETE => delete campaign code
async function deleteCode(req, res) {
    try {
        if (!(await Campaign.findById(req.params.id))) return cannedResponse.NotFound(res, strs.Campaign.Unknown);
        const code = await Code.findById(req.params.id2);
        if (!code) return cannedResponse.NotFound(res, strs.Code.Unknown);
        await code.deleteOne();
        cannedResponse.Gone(res, strs.Code.Deleted);
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

module.exports = { postCode, getCodes, getCode, putCode, deleteCode };
