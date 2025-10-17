const { Jester } = require('./utils');
const { getSwaggerJson } = require('../utils');
const json = getSwaggerJson();

Jester('4 | / (base) routes', ['4.1 | should return the home page', '/', 200], ['4.2 | should return the swagger API docs page', '/api-docs/', 200], ['4.3 | should return swagger.json', '/swagger.json', 200, json], ['4.4 | should have this cover the logout route', '/logout', 302], ['4.5 | should have this cover the 404 route', '/find/theme/notaroute', 404], ['4.6 | should have this cover the error handler', '/crash', 500]);
