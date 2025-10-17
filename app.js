require('dotenv').config();
const { handleErrors, verifyJwt, strs, cannedResponse } = require('./utils');
const DEVELOPMENT = 'development';

class App {
    get app() {
        return this._app;
    }

    constructor(callback) {
        this.callback = callback;
        const _app = (this._app = require('express')());
        _app.disable('x-powered-by')
            .use((req, res, next) => {
                res.setHeader('Access-Control-Allow-Origin', '*');
                next();
            })
            .use(require('cors')());
    }

    runCallback(...args) {
        this.callback(this, ...args);
        return this;
    }

    init() {
        const bodyParser = require('body-parser');
        const cookieParser = require('cookie-parser');
        this._app
            .use(bodyParser.urlencoded({ extended: true }))
            .use(bodyParser.json())
            .use(cookieParser());
        return this;
    }

    async db() {
        if (this._db) return;
        const self = this;
        return require('./db').init(async (err, db) => {
            if (err) return console.error(err);
            this._db = db;
            this._app.use(
                require('express-session')({
                    store: require('connect-mongo').create({
                        client: db.connection.getClient(),
                        dbName: 'session',
                        ttl: 1820,
                        autoRemove: 'interval',
                        autoRemoveInterval: 31
                    }),
                    secret: process.env.SESSION_SECRET,
                    resave: false,
                    saveUninitialized: false,
                    name: 'sessionId'
                })
            );
            return self;
        });
    }

    auth() {
        this._app.use(
            require('express-openid-connect').auth({
                auth0Logout: true,
                authorizationParams: {
                    response_mode: 'query',
                    response_type: 'code',
                    scope: 'openid argapi'
                },
                authRequired: false,
                enableTelemetry: false,
                routes: {
                    backchannelLogout: `/backchannel-logout`,
                    callback: `/callback`,
                    login: `/login`,
                    logout: `/logout`,
                    postLogoutRedirect: `/`
                },
                afterCallback: (req, res, sess, state) => {
                    console.dir([sess, state]);
                    res.cookie('__argapi.didAuthenticate__', 1);
                    res.locals.auth = 1;
                },
                session: { name: '__argapi.sess__' }
            })
        );
        return this;
    }

    mockAuth(mocker) {
        let loggedin = 1;
        let account = { type: 'ADMIN' };

        let locals = {
            loggedin,
            account
        };

        this._app.use((req, res, next) => {
            req.oidc = res.oidc = {
                user: { sub: 'sandwich' },
                req,
                res,
                next,
                idTokenClaims: [],
                login: () => {},
                logout: () => {},
                callback: () => {},
                isAuthenticated: () => true,
                errorOnRequiredAuth: false,
                backchannelLogout: () => {}
            };
            res.locals.mock = true;
            for (const [k, v] of Object.entries(locals)) res.locals[k] = v;
            next();
        });

        mocker.SetLocals = function (_locals) {
            locals = _locals;
        };

        return this;
    }

    routes() {
        this._app
            .use(handleErrors(verifyJwt))
            .use(handleErrors(require('./routes')))
            .use((req, res, next) => next({ status: 404, message: '404' }))
            .use((err, req, res, next) => {
                if (err === 'auth') return console.log(err);
                if (next.shutupeslint) next;
                if (err.status === 401) err.message = strs.Unauthorized;
                else if (err.status !== 404) {
                    console.error(`An error occured whilst accessing "${req.originalUrl}":`, err.message);
                    console.dir(err);
                    err.message = strs.RequestErr;
                } else if (process.env.NODE_ENVIRONMENT === DEVELOPMENT) console.log('Unknown path accessed: ' + req.originalUrl);
                cannedResponse[err.status ?? 500](res, err.message);
            });
        return this;
    }

    listen(port, cb) {
        this._app.listen(port, cb);
    }

    static async launch() {
        const app = new App();
        await app.init();
        await app.db();
        if (process.env.USE_AUTH === 'yes') await app.auth();
        else await app.mockAuth({});
        await app.routes();
        await app.listen(process.env.PORT, () => console.log(strs.Connected));
    }
}

module.exports = App;
