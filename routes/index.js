const express = require('express');
const router = express.Router();
const home = require('../controllers');
const swaggerUi = require('swagger-ui-express');
const { getSwaggerJson } = require('../utils');

// no auth
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(getSwaggerJson()));
router.get('/', home.home);
router.get('/loggedin', home.loggedIn);
router.get('/swagger.json', home.sendSwaggerJson);

// no auth
router.use('/find', require('./find'));

// organizer only
router.use('/campaign', require('./campaign'));

// organizer only, some admin only
router.use('/theme', require('./theme'));

// admin, some allow self
router.use('/user', require('./user'));

// no auth - gotta be last so they doesn't trap the others
router.use('/', require('./baseurl'));

module.exports = router;
