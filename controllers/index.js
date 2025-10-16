const { getSwaggerJson, cannedResponse, grantJwt, UserTypes } = require('../utils');
const path = require('path');
const User = require('../models/user');

function sendSwaggerJson(req, res) {
    try {
        res.json(getSwaggerJson());
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

function home(req, res) {
    try {
        res.sendFile(path.join(__dirname, '../', 'views', 'index.html'));
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

async function loggedIn(req, res) {
    try {
        if (!req.oidc.isAuthenticated()) {
            res.clearCookie('jwt');
            return cannedResponse.Unauthorized(res, { loggedIn: false });
        }

        const oauthUserData = req.oidc.user;
        const userId = oauthUserData.sub;
        const user = await User.findOne({ ident: userId });

        if (user) {
            grantJwt(res, user._doc);
            return cannedResponse.OK(res, { loggedIn: true });
        }

        const newUser = new User({
            ident: userId,
            account: oauthUserData,
            type: UserTypes.VIEWER
        });

        await newUser.save();

        grantJwt(res, newUser._doc);
        cannedResponse.OK(res, { loggedIn: true });
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

module.exports = {
    sendSwaggerJson,
    home,
    loggedIn
};
