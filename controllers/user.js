const User = require('../models/user');
const Manager = require('../models/manager');
const { cannedResponse, strs } = require('../utils');

// /user POST => (protected:admin) create user
async function postUser(req, res) {
    try {
        let { account, type } = req.body;
        if (!account) account = res.locals.account;
        const ident = account.sub;
        if (!ident) return cannedResponse.NotAcceptable(res, 'Account data missing required parameters');
        const user = new User({ account, type, ident });
        await user.save();
        cannedResponse.Created(res, { id: user._id });
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

// /user GET => (protected:admin) read all users
async function getUsers(req, res) {
    try {
        const users = await User.find();
        cannedResponse.OK(res, { users });
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

// /user/{id} GET => (protected:admin||self) read user
async function getUser(req, res) {
    try {
        const user = await User.findOne({ _id: req.params.id });
        if (!user) return cannedResponse.NotFound(res, strs.User.Unknown);
        cannedResponse.OK(res, { user });
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

// /user/{id} PUT => (protected:admin) update user
async function putUser(req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return cannedResponse.NotFound(res, strs.User.Unknown);
        user.type = req.body.type ?? user.type;
        user.account = req.body.account ?? user.account;
        await user.save();
        cannedResponse.OK(res, strs.User.Updated);
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

// /user/{id} DELETE => (protected:admin) delete user
async function deleteUser(req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return cannedResponse.NotFound(res, strs.User.Unknown);
        await Manager.deleteMany({ user: user._id });
        await user.deleteOne();
        cannedResponse.Gone(res, strs.User.Deleted);
    } catch (e) {
        console.error(e);
        cannedResponse.InternalServerError(res);
    }
}

module.exports = {
    getUsers,
    getUser,
    postUser,
    putUser,
    deleteUser
};
