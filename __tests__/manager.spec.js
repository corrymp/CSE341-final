const {Mocker, Jester} = require('./utils');

Jester('7 | /campaign/manager route',
    ['7.1 | should have status 200', Mocker.URL.campaign.managers, 200]
    ['7.2 | should have status 200', Mocker.URL.campaign.id.manager, 200]
);
