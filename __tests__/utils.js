const { describe, expect, it } = require('@jest/globals');
const request = require('supertest');
const {
    Types: { ObjectId }
} = require('mongoose');
const newObjectId = () => new ObjectId().toString();

describe('Jest can be rather annoying', () => it('should let this pass though', done => done()));

jest.mock('express-openid-connect', () => ({
    requiresAuth: jest.fn(() => (req, res, next) => next()),
    auth: jest.fn(() => (req, res, next) => {
        req.oidc = {
            isAuthenticated: () => true,
            user: {
                nickname: 'defaultUser',
                sub: 'default|123456789'
            }
        };
        next();
    })
}));

//#region Mocker

const now = new Date();
const past = new Date(`${now.getFullYear() - 5}-09-29`);
const future = new Date(`${now.getFullYear() + 5}-08-05`);

const margFallbackId = newObjectId();
const fantFallbackId = newObjectId();

const Themes = {
    highFantasy: { _id: newObjectId(), name: 'High Fantasy', description: 'High Fantasy is known for its use of swords, magic, and often elves.' },
    lowFantasy: { _id: newObjectId(), name: 'Low Fantasy', description: 'Low Fantasy is known for its use of swords, no magic, and rarely elves.' },
    futuristic: { _id: newObjectId(), name: 'Futuristic', description: 'Embrace the future!' },
    fantasy: { _id: newObjectId(), name: 'Fantasy', description: 'Castles and Magic abound!' },
    modern: { _id: newObjectId(), name: 'Modern', description: 'Our day is now!' },
    dystopian: { _id: newObjectId(), name: 'Dystopian', description: 'Literally 1984.' }
};

const Users = {
    alex: {
        _id: newObjectId(),
        account: {
            nickname: 'alex',
            sub: 'github|123456789'
        },
        ident: 'github|123456789',
        type: 'ADMIN'
    },
    benjamin: {
        _id: newObjectId(),
        account: {
            nickname: 'benjamin',
            sub: 'github|345678912'
        },
        ident: 'github|345678912',
        type: 'ORGANIZER'
    },
    caleb: {
        _id: newObjectId(),
        account: {
            nickname: 'caleb',
            sub: 'github|678912345'
        },
        ident: 'github|678912345',
        type: 'ORGANIZER'
    },
    daniel: {
        _id: newObjectId(),
        account: {
            nickname: 'daniel',
            sub: 'github|912345678'
        },
        ident: 'github|912345678',
        type: 'VIEWER'
    }
};

const Campaigns = {
    rohanmystery: {
        _id: newObjectId(),
        base_url: 'rohanmystery',
        title: 'Mystery in the Plains of Rohan',
        summary: "Something has happened in Rohan. What happened? Well, that's for you to discover...",
        theme: Themes.highFantasy._id
    },
    marg: {
        _id: newObjectId(),
        base_url: 'marg',
        title: 'A Modern ARG',
        summary: "It's very modern",
        theme: Themes.modern._id,
        open_at: new Date('1997-09-29T00:00:00.000Z'),
        invalid_code: margFallbackId
    },
    fant: {
        _id: newObjectId(),
        base_url: 'fant',
        title: 'Fantasy ARG',
        summary: "It's very fantasy",
        theme: Themes.fantasy._id,
        open_at: new Date('2002-02-26T00:00:00.000Z'),
        invalid_code: fantFallbackId
    },
    war: {
        _id: newObjectId(),
        base_url: 'war',
        title: 'Modern Warfare ARG',
        summary: "It's very violent",
        theme: Themes.modern._id,
        open_at: new Date('1999-09-03T00:00:00.000Z')
    },
    space: {
        _id: newObjectId(),
        base_url: 'space',
        title: 'The Great Space Race',
        summary: "It's very futuristic",
        theme: Themes.futuristic._id,
        open_at: new Date('1995-11-13T00:00:00.000Z')
    },
    1984: {
        _id: newObjectId(),
        base_url: '1984',
        title: '1984',
        summary: '1984',
        theme: Themes.dystopian._id,
        open_at: new Date('1984-04-04T00:00:00.000Z'),
        close_at: new Date('1986-03-14T00:00:00.000Z')
    }
};

const Resources = {
    theoden: {
        _id: newObjectId(),
        home_campaign: Campaigns.rohanmystery._id,
        resource: {
            type: 'html',
            html: '<p>This is a resource!</p>'
        }
    },
    mission1: {
        _id: newObjectId(),
        home_campaign: Campaigns.marg._id,
        resource: {
            type: 'string',
            string: 'Objective: Go to the bank'
        }
    },
    teller: {
        _id: newObjectId(),
        home_campaign: Campaigns.marg._id,
        resource: {
            type: 'string',
            string: 'Objective: withdraw life savings'
        }
    },
    gaze: {
        _id: newObjectId(),
        home_campaign: Campaigns.fant._id,
        resource: {
            type: 'string',
            string: 'Hello stranger! Can I interest you in some wares?'
        }
    },
    missioncontrol: {
        _id: newObjectId(),
        home_campaign: Campaigns.space._id,
        resource: {
            type: 'string',
            string: 'Houston, we have a problem.'
        }
    },
    moon: {
        _id: newObjectId(),
        home_campaign: Campaigns.space._id,
        resource: {
            type: 'string',
            string: "Moon's stuck in a time loop."
        }
    },
    marg_fallback: {
        _id: margFallbackId,
        home_campaign: Campaigns.marg._id,
        resource: {
            type: 'string',
            string: 'This is a fallback resource!'
        }
    },
    fant_fallback: {
        _id: fantFallbackId,
        home_campaign: Campaigns.fant._id,
        resource: {
            type: 'string',
            string: 'This is also a fallback resource!'
        }
    }
};

const Codes = {
    theoden: {
        _id: newObjectId(),
        code: 'theoden',
        target_resource: Resources.theoden._id,
        home_campaign: Campaigns.rohanmystery._id,
        valid_after: past,
        valid_until: future
    },
    mission1: {
        _id: newObjectId(),
        code: 'mission1',
        target_resource: Resources.mission1._id,
        home_campaign: Campaigns.marg._id,
        valid_after: past,
        valid_until: future
    },
    missioncontrol: {
        _id: newObjectId(),
        code: 'missioncontrol',
        target_resource: Resources.missioncontrol._id,
        home_campaign: Campaigns.space._id,
        valid_after: past,
        valid_until: future
    },
    gaze: {
        _id: newObjectId(),
        code: 'gaze',
        target_resource: Resources.gaze._id,
        home_campaign: Campaigns.fant._id,
        valid_after: past,
        valid_until: future
    },
    moon: {
        _id: newObjectId(),
        code: 'moon',
        target_resource: Resources.moon._id,
        home_campaign: Campaigns.space._id,
        valid_after: past,
        valid_until: future
    },
    teller: {
        _id: newObjectId(),
        code: 'teller',
        target_resource: Resources.teller._id,
        home_campaign: Campaigns.marg._id,
        valid_after: past,
        valid_until: future
    },
    expired: {
        _id: newObjectId(),
        code: 'expired',
        target_resource: Resources.moon._id,
        home_campaign: Campaigns.space._id,
        valid_until: past
    },
    alsoexpired: {
        _id: newObjectId(),
        code: 'expired',
        target_resource: Resources.teller._id,
        home_campaign: Campaigns.marg._id,
        valid_until: past
    },
    inactive: {
        _id: newObjectId(),
        code: 'inactive',
        target_resource: Resources.missioncontrol._id,
        home_campaign: Campaigns.space._id,
        valid_after: future
    },
    alsoinactive: {
        _id: newObjectId(),
        code: 'inactive',
        target_resource: Resources.gaze._id,
        home_campaign: Campaigns.fant._id,
        valid_after: future
    }
};

const Managers = [
    { user: Users.alex._id, campaign: Campaigns.rohanmystery._id },
    { user: Users.alex._id, campaign: Campaigns.war._id },
    { user: Users.alex._id, campaign: Campaigns[1984]._id },
    { user: Users.benjamin._id, campaign: Campaigns.marg._id },
    { user: Users.benjamin._id, campaign: Campaigns.fant._id },
    { user: Users.caleb._id, campaign: Campaigns.marg._id },
    { user: Users.caleb._id, campaign: Campaigns.space._id }
];

const fake = {
    theme: {
        _id: '68f1436808f0a1c4bff1face',
        name: 'not-a-theme',
        description: 'This is not a theme.'
    },
    user: {
        _id: '68f1436808f0a1c4bff1face',
        account: {
            nickname: 'fakeuser',
            sub: 'fake|123456789'
        },
        ident: 'fake|123456789',
        type: 'ADMIN'
    },
    campaign: {
        _id: '68f1436808f0a1c4bff1face',
        base_url: 'not-a-campaign',
        title: 'This is not a campaign',
        summary: "It just isn't one",
        theme: '68f1436808f0a1c4bff1face',
        open_at: past,
        close_at: future
    },
    resource: {
        _id: '68f1436808f0a1c4bff1face',
        home_campaign: '68f1436808f0a1c4bff1face',
        resource: {
            type: 'fake',
            fake: 'This is not a resource'
        }
    },
    code: {
        _id: '68f1436808f0a1c4bff1face',
        code: 'not-a-code',
        target_resource: '68f1436808f0a1c4bff1face',
        home_campaign: '68f1436808f0a1c4bff1face'
    }
};

const URL = {
    toString: () => '/',
    loggedin: '/loggedin',
    apiDocs: '/api-docs',
    swaggerJson: '/swager.json',

    find: {
        toString: () => '/find',
        theme: '/find/theme',
        id: {
            valid: `/find/${Themes.modern._id}`,
            invalid: `/find/${fake.theme._id}`
        },
        name: {
            valid: `/find/${Themes.fantasy.name}`,
            invalid: `/find/${fake.theme.name}`
        },
        ongoing: {
            toString: () => '/find/ongoing',
            id: {
                valid: `/find/ongoing/${Themes.futuristic._id}`,
                invalid: `/find/ongoing/${fake.theme._id}`
            },
            name: {
                valid: `/find/ongoing/${Themes.modern.name}`,
                invalid: `/find/ongoing/${fake.theme.name}`
            }
        },
        concluded: {
            toString: () => '/find/concluded',
            id: {
                valid: `/find/concluded/${Themes.lowFantasy._id}`,
                invalid: `/find/concluded/${fake.theme._id}`
            },
            name: {
                valid: `/find/concluded/${Themes.dystopian.name}`,
                invalid: `/find/concluded/${fake.theme.name}`
            }
        }
    },

    baseUrl: {
        invalid: `/${fake.campaign.base_url}`,
        valid: {
            current: {
                noFallback: `/${Campaigns.space.base_url}`,
                fallback: `/${Campaigns.marg.base_url}`
            },
            past: `/${Campaigns[1984].base_url}`,
            future: `/${Campaigns.rohanmystery.base_url}`
        },
        code: {
            invalid: {
                invalid: `/${fake.campaign.base_url}/${fake.code.code}`,
                valid: `/${fake.campaign.base_url}/${Codes.gaze.code}`
            },
            valid: {
                invalid: {
                    noFallback: `/${Campaigns.war.base_url}/${fake.code.code}`,
                    fallback: `/${Campaigns.marg.base_url}/${fake.code.code}`
                },
                expired: {
                    noFallback: `/${Campaigns.space.base_url}/${Codes.expired.code}`,
                    fallback: `/${Campaigns.marg.base_url}/${Codes.alsoexpired.code}`
                },
                inactive: {
                    noFallback: `/${Campaigns.space.base_url}/${Codes.inactive.code}`,
                    fallback: `/${Campaigns.fant.base_url}/${Codes.alsoinactive.code}`
                },
                current: {
                    noFallback: `/${Campaigns.marg.base_url}/${Codes.teller.code}`,
                    fallback: `/${Campaigns.fant.base_url}/${Codes.gaze.code}`
                }
            }
        }
    },

    campaign: {
        toString: () => '/campaign',
        managers: '/campaign/managers',
        id: {
            valid: `/campaign/${Campaigns[1984]._id}`,
            invalid: `/campaign/${fake.campaign._id}`,
            manager: `/campaign/${Campaigns.fant._id}/manager`,
            code: {
                toString: () => `/campaign/${Campaigns.marg._id}/code`,
                id: {
                    valid: `/campaign/${Campaigns.marg._id}/code/${Codes.teller._id}`,
                    invalid: `/campaign/${Campaigns.space._id}/code/${fake.code.code}`
                },
                valid: `/campaign/${Campaigns.fant._id}/code/${Codes.alsoinactive.code}`,
                invalid: `/campaign/${Campaigns[1984]._id}/code/${fake.code._id}`
            },
            resource: {
                toString: () => `/campaign/${Campaigns.fant._id}/resource`,
                id: {
                    valid: `/campaign/${Campaigns.fant._id}/resource/${Resources.gaze._id}`,
                    invalid: `/campaign/${Campaigns.fant._id}/resource/${fake.resource._id}`
                }
            }
        }
    },

    theme: {
        toString: () => '/theme',
        id: {
            valid: `/theme/${Themes.modern._id}`,
            invalid: `/theme/${fake.theme._id}`
        },
        name: {
            valid: `/theme/${Themes.dystopian.name}`,
            invalid: `/theme/${fake.theme.name}`
        }
    },

    user: {
        toString: () => '/user',
        id: {
            valid: `/user/${Users.alex._id}`,
            invalid: `/user/${fake.user._id}`,
            campaigns: {
                valid: `/user/${Users.caleb._id}/campaigns`,
                invalid: `/user/${fake.user._id}/campaigns`
            }
        }
    }
};

class Mocker {
    static Defaults() {
        Mocker.doLogs = false;
        Mocker.SetLocals({
            loggedin: 1,
            account: { type: 'ADMIN' }
        });
    }

    static SanitizeCampaign = campaign => ({ title: campaign.title, theme: campaign.theme, base_url: campaign.base_url, summary: campaign.summary });
    static SanitizeCampaigns = campaigns => campaigns.map(c => Mocker.SanitizeCampaign(c));

    static Themes = Object.freeze(Themes);
    static _Theme = Object.freeze(Object.values(Themes));
    static Users = Object.freeze(Users);
    static _User = Object.freeze(Object.values(Users));
    static Campaigns = Object.freeze(Campaigns);
    static _Campaign = Object.freeze(Object.values(Campaigns));
    static Resources = Object.freeze(Resources);
    static _Resource = Object.freeze(Object.values(Resources));
    static Codes = Object.freeze(Codes);
    static _Code = Object.freeze(Object.values(Codes));
    static Managers = Object.freeze(Managers);
    static URL = Object.freeze(URL);
    static NotFound = Object.freeze({ message: 'Not Found' });

    static SetLocals = () => null;
    static doLogs = false;

    static Search(_, q, op, collection) {
        let log = '';
        let results = [...collection];
        if (!Object.keys(q).length) return results;

        if (op === 'find' && Object.keys(q).includes('_id') && q._id instanceof ObjectId) op = 'find(One)';
        Mocker.doLogs && (log += 'SETUP ' + JSON.stringify(q) + op + '\n');
        Mocker.doLogs && (log += 'BEFORE ' + JSON.stringify(results) + '\n');

        for (const [k, v] of Object.entries(q))
            ((results = results.filter(i => {
                if (v instanceof ObjectId) return v.equals(i[k]);
                else if (typeof k === 'object') {
                    if (v.$in) if (v.$in.includes(i[k])) return true;
                    for (const [k2, v2] of Object.entries(k)) console.log('//! I need help checking this:', k, v, k2, v2, i[k]);
                    return false;
                } else return i[k] === v;
            })),
                Mocker.doLogs && (log += 'AFTER ' + JSON.stringify(results) + '\n'));
        Mocker.doLogs && console.log(log + 'AFTER ' + JSON.stringify(results));
        return op === 'find' ? results : (results[0] ?? null);
    }

    static Theme = q => Mocker.Search(q, q._conditions, q.op, Mocker._Theme);
    static User = q => Mocker.Search(q, q._conditions, q.op, Mocker._User);
    static Campaign = q => Mocker.Search(q, q._conditions, q.op, Mocker._Campaign);
    static Resource = q => Mocker.Search(q, q._conditions, q.op, Mocker._Resource);
    static Code = q => Mocker.Search(q, q._conditions, q.op, Mocker._Code);
    static Manager = q => Mocker.Search(q, q._conditions, q.op, Mocker.Managers);
}

const App = require('../app');

const app = new App(this_app => {
    this_app._app.use('/crash', (req, res, next) => {
        console.log('/crash was accessed during a test... How about I pass an error instead?');
        if (req && res && next) next(new Error('Jest and ESLint made me do it'));
        else next();
    });
})
    .init()
    .mockAuth(Mocker)
    .runCallback()
    .routes().app;

const Mockingoose = require('mockingoose');
const Campaign = require('../models/campaign');
const Code = require('../models/code');
const Manager = require('../models/manager');
const Resource = require('../models/resource');
const Theme = require('../models/theme');
const User = require('../models/user');

Mockingoose(Campaign).toReturn(Mocker.Campaign, 'findOne');
Mockingoose(Campaign).toReturn(Mocker.Campaign, 'find');
Mockingoose(Code).toReturn(Mocker.Code, 'findOne');
Mockingoose(Code).toReturn(Mocker.Code, 'find');
Mockingoose(Manager).toReturn(Mocker.Manager, 'findOne');
Mockingoose(Manager).toReturn(Mocker.Manager, 'find');
Mockingoose(Resource).toReturn(Mocker.Resource, 'findOne');
Mockingoose(Resource).toReturn(Mocker.Resource, 'find');
Mockingoose(Theme).toReturn(Mocker.Theme, 'findOne');
Mockingoose(Theme).toReturn(Mocker.Theme, 'find');
Mockingoose(User).toReturn(Mocker.User, 'findOne');
Mockingoose(User).toReturn(Mocker.User, 'find');

//#endregion

//#region Jester

function DescribeIt(testName, url, status, result) {
    it(testName, async () => {
        const response = await request(app).get(url);

        if ((status && status !== response.statusCode) || (result && JSON.stringify(result) !== JSON.stringify(response.body))) {
            const lineLength = testName.length + url.length + 2;
            const linebreak = ''.padStart(lineLength, '=');
            const subbreak = ''.padStart(lineLength, '-');
            const resString = JSON.stringify(result);
            const bodString = JSON.stringify(response.body);
            console.log(`
${linebreak}
${testName}: ${url}
Expected status: ${status} (got: ${response.statusCode})

${subbreak}
Expected body: ${(resString ?? '').slice(0, lineLength) ?? resString}
${subbreak}
          Got: ${(bodString ?? '').slice(0, lineLength) ?? bodString}

${linebreak}
`);
        }

        if (status) expect(response.statusCode).toBe(status);
        if (result) expect(response.body).toEqual(result);
    });
}

function Jester(blockName, opts, ...descriptions) {
    if (Array.isArray(opts)) {
        descriptions.unshift(opts);
        opts = undefined;
    }
    opts = opts ?? {};

    Mocker.Defaults();

    if (opts.locals !== undefined) Mocker.SetLocals(opts.locals);
    if (opts.log !== undefined) Mocker.doLogs = opts.log;

    if (opts.skip !== undefined) describe.skip(blockName, () => {});
    else describe(blockName, () => descriptions.forEach(description => DescribeIt(...description)));
}

Jester.DescribeIt = DescribeIt;

//#endregion

module.exports = { Mocker, Jester };

/*
```md
# Testing All Get/GetAll Routes

PATH                            EXPECTED RESPONSE

## Get* (not really part of the API)

- /                             200(,500), html, /views/index.html
- /loggedin                     200(,500), json, {loggedIn: boolean}
- /api-docs                     200(,500), html, swagger UI express
- /find                         200(,500), html, /views/find.html
- /swagger.json                 200(,500), json, {...swagger.json}

## Get

- /:baseUrl                     200(,404,500), json, {title: string, theme: ObjectId, base_url: string, summary: string}
- /:baseUrl/:code               200(,404,500), json, {type: string, "<type>": <type>} //$ The string in "type" dictates the name and type of the other key: {type:'html',html:'<p>this is html</p>'}
- /campaign/:id                 200(,500), json, {campaign: {_id: ObjectId, title: string, theme: ObjectId, base_url: string, summary: string, invalid_code: ObjectId, open_at: Date, close_at: Date}}
- /campaign/:id/code/:id2       200(,404,500), json, {code: {_id: ObjectId, code: string, target_resource: ObjectId, home_campaign: ObjectId, valid_after: Date, valid_until: Date}}
- /campaign/:id/code/:code      200(,404,500), json, {code: {_id: ObjectId, code: string, target_resource: ObjectId, home_campaign: ObjectId, valid_after: Date, valid_until: Date}}
- /campaign/:id/resource/:id2   200(,404,500), json, {resource: {_id: ObjectId, home_campaign: ObjectId, resource: Object}
- /theme/:id                    200(,404,500), json, {theme: {_id: ObjectId, name: string, desciption: string}}
- /theme/:name                  200(,404,500), json, {theme: {_id: ObjectId, name: string, desciption: string}}
- /user/:id                     200(,404,500), json, {user: {_id: ObjectId, ident: string, type: Enum('VIEWER','ORGANIZER','ADMIN'), account: Object}}

## GetAll

- /find/theme                   200(,500), json, {themes: [{...theme},...]}
- /find/:id                     200(,404,500), json, {campaigns: [{...campaign},...]}
- /find/:name                   200(,404,500), json, {campaigns: [{...campaign},...]}
- /find/ongoing                 200(,404,500), json, {ongoing_campaigns: [{...campaign},...]}
- /find/ongoing/:id             200(,404,500), json, {ongoing_campaigns_by_theme: [{...campaign},...]}
- /find/ongoing/:name           200(,404,500), json, {ongoing_campaigns_by_campaigns: [{...campaign},...]}
- /find/concluded               200(,404,500), json, {concluded_campaigns: [{...campaign},...]}
- /find/concluded/:id           200(,404,500), json, {concluded_campaigns_by_theme: [{...campaign},...]}
- /find/concluded/:name         200(,404,500), json, {concluded_campaigns_by_theme: [{...campaign},...]}
- /campaign                     200(,500), json, {campaigns: [{...campaign},...]}
- /campaign/managers            200(,500), json, {managers: [{_id: ObjectId, user: ObjectId, campaign: ObjectId},...]}
- /campaign/:id/manager         200(,404,500), json, {managers: [{_id: ObjectId, user: ObjectId, campaign: ObjectId},...]}
- /campaign/:id/code            200(,404,500), json, {codes: [{...code},{...code},...]}
- /campaign/:id/resource        200(,404,500), json, {resources: [{...resource},...]}
- /theme                        200(,500), json, {themes: [{...theme},...]}
- /user                         200(,500), json, {users: [{...user},...]}
- /user/:id/campaigns           200(,404,500), json, {campaigns: [{...campaign},...]}

```;/**/
