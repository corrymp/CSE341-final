const { Mocker, Jester } = require('./utils');

Jester('1 | /campaign routes', ['1.1 | should have status 200', Mocker.URL.campaign, 200, { campaigns: JSON.parse(JSON.stringify(Mocker._Campaign)) }], ['1.2 |', Mocker.URL.campaign.id.invalid, 404], ['1.3 |', Mocker.URL.campaign.id.valid, 200]);
