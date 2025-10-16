const {Mocker, Jester} = require('./utils');

Jester('10 | /user routes',
    ['10.1 | should have status 200', Mocker.URL.user, 200],
    ['10.2 | should have status 200 on valid id', Mocker.URL.user.id.valid, 200],
    ['10.3 | should have status 200 on valid id', Mocker.URL.user.id.campaigns.valid, 200],
    ['10.4 | should have status 404 on invalid id', Mocker.URL.user.id.campaigns.invalid, 404],
);
