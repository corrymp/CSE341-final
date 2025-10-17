const Theme = require('../models/theme');
const Campaign = require('../models/campaign');
const { cannedResponse, resolveToIdOrName, strs } = require('../utils');

// /theme POST => (protected:admin) create theme
async function postTheme(req, res) {
    try {
        if (await Theme.findOne({ name: req.body.name })) return cannedResponse.NotAcceptable(res, strs.Theme.Exists);
        const theme = new Theme({ name: req.body.name, description: req.body.description });
        await theme.save();
        cannedResponse.Created(res, { id: theme._id });
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

// /theme GET => read all themes
async function getThemes(req, res) {
    try {
        const themes = await Theme.find().lean();
        cannedResponse.OK(res, { themes });
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

// /theme/{id|name} GET => read theme
async function getThemeByIdOrName(req, res) {
    try {
        const idOrName = await resolveToIdOrName(req.params.idOrName, Theme);
        if (!idOrName.result) return cannedResponse.NotFound(res, strs.Theme.Unknown);
        const theme = await Theme.findById(idOrName.id).lean();
        cannedResponse.OK(res, { theme });
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

// /theme/{id} PUT => (protected:admin) update theme
async function putTheme(req, res) {
    try {
        const _id = req.params.id;
        const theme = await Theme.findById(_id);
        if (!theme) return cannedResponse.NotFound(res, strs.Theme.Unknown);

        const name = req.body.name;
        const existing = await Theme.findOne({ name });
        if (existing && !existing._id.equals(_id)) return cannedResponse.NotAcceptable(res, strs.Theme.Exists);

        theme.name = name ?? theme.name;
        theme.description = req.body.description ?? theme.description;

        await theme.save();
        cannedResponse.OK(res, strs.Theme.Updated);
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

// /theme/{id} DELETE => (protected:admin) delete theme
async function deleteTheme(req, res) {
    try {
        const theme = await Theme.findById(req.params.id);
        if (!theme) return cannedResponse.NotFound(res, strs.Theme.Unknown);
        const campaigns = await Campaign.find({ theme: theme._id }).lean();
        if (campaigns.length) return cannedResponse.Conflict(res, strs.Theme.UsedByCampaign);
        await theme.deleteOne();
        cannedResponse.Gone(res, strs.Theme.Deleted);
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

module.exports = {
    getThemes,
    getThemeByIdOrName,
    postTheme,
    putTheme,
    deleteTheme
};
