const {Mocker, Jester} = require('./utils');

Jester('9 | /theme routes',
    ['9.1 | should have status 200', Mocker.URL.theme, 200],
    ['9.2 | should have status 200 on valid theme id', Mocker.URL.theme.id.valid, 200],
    ['9.3 | should have status 404 on invalid theme id', Mocker.URL.theme.id.invalid, 404],
    ['9.4 | should have status 200 on valid theme name', Mocker.URL.theme.name.valid, 200],
    ['9.5 | should have status 404 on invalid theme name', Mocker.URL.theme.name.invalid, 404]
);
