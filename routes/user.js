const router = require('express').Router();
const user = require('../controllers/user');
const manager = require('../controllers/manager');
const userValidator = require('../validation/user');
const { requiredPermissionLevel, validator, requiresAuth } = require('../utils');

router.get('/:id/campaigns', requiresAuth(), requiredPermissionLevel('ADMIN', true), manager.getCampaignsManagedByUser); // /user/{id}/camapigns GET

router.get('/:id', requiresAuth(), requiredPermissionLevel('ADMIN', true), validator.path(), validator, user.getUsers); // /user/{id} GET => (protected:admin||self) read user

router.put('/:id', requiresAuth(), requiredPermissionLevel('ADMIN'), userValidator.update, validator, user.putUser); // /user/{id} PUT => (protected:admin) update user

router.delete('/:id', requiresAuth(), requiredPermissionLevel('ADMIN', true), validator.path(), validator, user.deleteUser); // /user/{id} DEL => (protected:admin||self) delete user

router.post('/', requiresAuth(), requiredPermissionLevel('ADMIN'), userValidator.create(), validator, user.postUser); // /user POST => (protected:admin) create user

router.get('/', requiresAuth(), requiredPermissionLevel('ADMIN'), user.getUsers); // /user GET => (protected:admin) read all users

module.exports = router;
