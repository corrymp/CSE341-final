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

function home(req, res, next) {
    try {
        if (req.cookies['__argapi.didAuthenticate__']) return loggedIn(req, res, next);
        res.sendFile(path.join(__dirname, '../', 'views', 'index.html'));
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

function login(req, res) {
    res.redirect('/loggedin');
}

function logout(req, res) {
    res.clearCookie('jwt');
    res.redirect('/');
}

async function loggedIn(req, res) {
    try {
        if (!req.oidc.isAuthenticated()) {
            res.clearCookie('jwt');
            return cannedResponse.Unauthorized(res, { loggedIn: false });
        }

        const oauthUserData = req.oidc.user;
        const userId = oauthUserData.sub;
        let user;
        if (res.locals.mock) {
            user = {
                _doc: {
                    _id: '6e5c4c6b79b4f06c42fcde86',
                    type: 'ADMIN',
                    account: {
                        nickname: 'mockuser',
                        sub: 'mock|123456789'
                    }
                }
            };
        } else user = await User.findOne({ ident: userId });

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
    login,
    logout,
    loggedIn
};
