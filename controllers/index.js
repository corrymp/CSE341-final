const { getSwaggerJson, cannedResponse } = require('../utils');
const path = require('path');

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

function logout(req, res, next) {
    try {
        res.clearCookie(process.env.CK_NAME);
        res.clearCookie('jwt');
        res.redirect('/');
    } catch (e) {
        console.error(e);
        next(e);
    }
}

module.exports = {
    sendSwaggerJson,
    home,
    logout
};
