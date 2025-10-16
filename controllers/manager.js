const User = require('../models/user');
const Campaign = require('../models/campaign');
const Manager = require('../models/manager');
const { cannedResponse, strs } = require('../utils');

//#region helpers
/**
 * @description Takes a user ID and finds all campaigns they manage
 * @param {import('mongoose').ObjectId} userId - user ID to find management permissions for
 * @returns {ObjectId[]} - list of campaigns user manages
 */
async function getManagerByUser(userId) {
    const campaigns = await Manager.find({ user: userId });
    return campaigns.map(c => c.campaign);
}

/**
 * @description Takes a campaign ID and finds all the campaigns managers
 * @param {import('mongoose').ObjectId} userId - campaign ID to find managers for
 * @returns {ObjectId[]} - list of user managing campaign
 */
async function getManagerByCampaign(campaignId) {
    const users = await Manager.find({ campaign: campaignId });
    return users.map(c => c.user);
}
//#endregion

// /campaign/{id}/manager/{id2}
async function postManager(req, res) {
    try {
        const campaignId = req.params.id;
        const userId = req.params.id2;
        const existing = await Manager.findOne({ user: userId, campaign: campaignId });
        if (existing) return cannedResponse.NotAcceptable(res, strs.User.AlreadyManager);
        const newManager = new Manager({ user: userId, campaign: campaignId });
        await newManager.save();
        cannedResponse.Created(res, strs.User.MadeManager);
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

// /campaign/managers
async function getManagers(req, res) {
    try {
        const managers = await Manager.find();
        cannedResponse.OK(res, { managers });
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

// /campaign/{id}/manager
async function getUsersManagingCampaign(req, res) {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if(!campaign) return cannedResponse.NotFound(res, strs.Campaign.Unknown);
        const managerList = await getManagerByCampaign(req.params.id);
        const managers = await User.find({ _id: { $in: managerList } });
        cannedResponse.OK(res, { managers });
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

// /user/{id}/camapigns
async function getCampaignsManagedByUser(req, res) {
    try {
        const user = await User.findById(req.params.id);
        if(!user) return cannedResponse.NotFound(res, strs.User.Unknown);
        const campaignList = await getManagerByCampaign(req.params.id);
        const campaigns = await Campaign.find({ _id: { $in: campaignList } });
        cannedResponse.OK(res, { campaigns });
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

// /campaign/{id}/manager/{id2}/{id3}
async function putManagerChangeCampaign(req, res) {
    try {
        const oldCampaignId = req.params.id;
        const userId = req.params.id2;
        const newCampaignId = req.params.id3;
        const oldPermissions = Manager.findOne({ user: userId, campaign: oldCampaignId });
        const newPermissions = Manager.findOne({ user: userId, campaign: newCampaignId });
        if (!oldPermissions && newPermissions) return cannedResponse.NotAcceptable(res, strs.User.PossibleIDSwap);
        if (!oldPermissions) return cannedResponse.NotFound(res, strs.User.NotManager);
        if (newPermissions) return cannedResponse.NotAcceptable(res, strs.User.AlreadyManager);
        oldPermissions.campaign = newCampaignId;
        oldPermissions.save();
        cannedResponse.OK(res, strs.User.PermissionsChanged);
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

// /campaign/{id}/manager/{id2}/user/{id3}
async function putManagerChangeUser(req, res) {
    try {
        const campaignId = req.params.id;
        const oldUserId = req.params.id2;
        const newUserId = req.params.id3;
        const oldPermissions = Manager.findOne({ user: oldUserId, campaign: campaignId });
        const newPermissions = Manager.findOne({ user: newUserId, campaign: campaignId });
        if (!oldPermissions && newPermissions) return cannedResponse.NotAcceptable(res, strs.User.PossibleIDSwap);
        if (!oldPermissions) return cannedResponse.NotFound(res, strs.User.NotManager);
        if (newPermissions) return cannedResponse.NotAcceptable(res, strs.User.AlreadyManager);
        oldPermissions.user = newUserId;
        oldPermissions.save();
        cannedResponse.OK(res, strs.User.PermissionsChanged);
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

// /campaign/{id}/manager/{id2}
async function deleteManager(req, res) {
    try {
        const campaignId = req.params.id;
        const userId = req.params.id2;
        const existing = await Manager.findOne({ user: userId, campaign: campaignId });
        if (!existing) return cannedResponse.NotFound(res, strs.User.NotManager);
        await existing.removeOne();
        cannedResponse.Gone(res, strs.User.RemoveManager);
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

module.exports = {
    postManager,
    getManagers,

    getCampaignsManagedByUser,
    getUsersManagingCampaign,

    putManagerChangeCampaign,
    putManagerChangeUser,

    deleteManager,

    getManagerByCampaign,
    getManagerByUser
};
