const router = require('express').Router();
const { validator, requiredPermissionLevel } = require('../utils');
const manager = require('../controllers/manager');

// admin only
router.get('/managers', requiredPermissionLevel('ADMIN'), manager.getManagers); // /campaign/managers GET => get all mngr records for all cmpns

router.get('/:id/manager', validator.path(), validator, manager.getUsersManagingCampaign); // /campaign/{id}/manager GET => view all mngrs for a given cmpn

router.post('/:id/manager/:id2', validator.path(), validator, manager.postManager); // /campaign/{id}/manager/{id2} POST => assign new mngr

router.delete('/:id/manager/:id2', validator.path(), validator, manager.deleteManager); // /campaign/{id}/manager/{id2} DELETE => remove a mngr

// admin only
router.put('/:id/manager/:id2/user/:id3', requiredPermissionLevel('ADMIN'), validator.path(), validator, manager.putManagerChangeUser); // /campaign/{id}/manager/{id2}/user/{id3} PUT => switch out a mngr with another user

// admin only
router.put('/:id/manager/:id2/:id3', requiredPermissionLevel('ADMIN'), validator.path(), validator, manager.putManagerChangeCampaign); // /campaign/{id}/manager/{id2}/{id3} PUT => shift mngmt perms from one cmpn to another

module.exports = router;
