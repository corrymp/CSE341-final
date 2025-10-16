const path = require('path');
const Campaign = require('../models/campaign');
const Theme = require('../models/theme');
const { cannedResponse, resolveToIdOrName, sanitizeCampaigns, strs } = require('../utils');

// idk why I found the need to do it this way, but w/e I guess it helps with testing or something
const findCampaignByCriteria = async criteria => await Campaign.find(criteria);

async function info(req, res) {
    try {
        res.sendFile(path.join(__dirname, '../', 'views', 'find.html'));
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

async function findTheme(req, res) {
    try {
        const themes = await Theme.find();
        cannedResponse.OK(res, { themes });
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

async function findAllOfTheme(req, res) {
    try {
        const idOrName = await resolveToIdOrName(req.params.idOrName, Theme);
        if (!idOrName.result) return cannedResponse.NotFound(res, strs.Theme.Unknown);
        const campaigns_by_theme = await findCampaignByCriteria({ theme: idOrName.id, open_at: { $exists: true } });
        sanitizeCampaigns(campaigns_by_theme);
        cannedResponse.OK(res, { campaigns_by_theme });
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

async function findOngoing(req, res) {
    try {
        const now = Date.now();
        const ongoing_campaigns = await findCampaignByCriteria({ open_at: { $lt: now }, $or: [{ close_at: { $gt: now } }, { close_at: { $exists: false } }] });
        sanitizeCampaigns(ongoing_campaigns);
        cannedResponse.OK(res, { ongoing_campaigns });
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

async function findOngoingWithTheme(req, res) {
    try {
        const idOrName = await resolveToIdOrName(req.params.idOrName, Theme);
        if (!idOrName.result) return cannedResponse.NotFound(res, strs.Theme.Unknown);
        const now = Date.now();
        const ongoing_campaigns_by_theme = await findCampaignByCriteria({ theme: idOrName.id, open_at: { $lt: now }, $or: [{ close_at: { $gt: now } }, { close_at: { $exists: false } }] });
        sanitizeCampaigns(ongoing_campaigns_by_theme);
        cannedResponse.OK(res, { ongoing_campaigns_by_theme });
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

async function findConcluded(req, res) {
    try {
        const concluded_campaigns = await findCampaignByCriteria({ close_at: { $lt: Date.now() } });
        sanitizeCampaigns(concluded_campaigns);
        cannedResponse.OK(res, { concluded_campaigns });
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

async function findConcludedWithTheme(req, res) {
    try {
        const idOrName = await resolveToIdOrName(req.params.idOrName, Theme);
        if (!idOrName.result) return cannedResponse.NotFound(res, strs.Theme.Unknown);
        const concluded_campaigns_by_theme = await findCampaignByCriteria({ theme: idOrName.id, close_at: { $lt: Date.now() } });
        sanitizeCampaigns(concluded_campaigns_by_theme);
        cannedResponse.OK(res, { concluded_campaigns_by_theme });
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

module.exports = {
    info,
    findConcluded,
    findConcludedWithTheme,
    findOngoing,
    findOngoingWithTheme,
    findTheme,
    findAllOfTheme
};
