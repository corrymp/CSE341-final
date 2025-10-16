const {Mocker, Jester} = require('./utils');

Jester('2 |/campaign/{id}/code routes', 
    ['2.1 | should have status 200', Mocker.URL.campaign.id.code, 200],
    ['2.2 | should have status 200 on valid code', Mocker.URL.campaign.id.code.valid, 200],
    ['2.3 | should have status 404 on invalid code', Mocker.URL.campaign.id.code.invalid, 404],
    ['2.4 | should have status 200 on valid code', Mocker.URL.campaign.id.code.id.valid, 200],
    ['2.5 | should have status 404 on invalid code', Mocker.URL.campaign.id.code.id.invalid, 404]
);
