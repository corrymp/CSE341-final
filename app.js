require('dotenv').config();
const jwt = require('jsonwebtoken');
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
        console.info('using live auth');
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
                afterCallback: (req, res, sess) => {
                    const id = jwt.decode(sess.id_token);
                    res.cookie(process.env.CK_NAME, jwt.sign(id, process.env.ACCESS_TOKEN_SECRET), { httpOnly: true, maxAge: 3600000, secure: process.env.NODE_ENVIRONMENT !== DEVELOPMENT });
                },
                session: { name: '__argapi_sess__' }
            })
        );
        return this;
    }

    mockAuth(mocker) {
        console.info('using mock auth');
        let loggedin;
        let account = { type: 'ADMIN', _id: '68edcf24c60f4b97b6c4c5e6' };

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
            .use(async (req, res, next) => {
                // set by auth0 when logging out
                if (req.cookies.skipSilentLogin) {
                    res.clearCookie('skipSilentLogin');
                    res.clearCookie('jwt');
                    res.clearCookie(process.env.CK_NAME);
                    return next();
                }

                if (req.cookies.jwt) return next();
                if (!req.cookies[process.env.CK_NAME]) return next();

                const data = jwt.verify(req.cookies[process.env.CK_NAME], process.env.ACCESS_TOKEN_SECRET);

                if (this._db) {
                    const user = await this._db.models.User.findOne({ ident: data.sub }).lean();
                    if (!user) return next();

                    res.cookie('jwt', jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600000 }), { httpOnly: true, maxAge: 3600000, secure: process.env.NODE_ENV !== DEVELOPMENT });
                }
                next();
            })
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
