const { Mocker, Jester } = require('./utils');

Jester('8 | /campaign/{id}/resource routes', ['8.1 | should have status 200', Mocker.URL.campaign.id.resource, 200], ['8.2 | should have status 200 on valid resource id', Mocker.URL.campaign.id.resource.id.valid, 200], ['8.3 | should have status 404 on invalid resource id', Mocker.URL.campaign.id.resource.id.invalid, 404]);
