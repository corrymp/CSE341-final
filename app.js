if (!process.env.ENV_LOADED) require('dotenv').config();
const { handleErrors, verifyJwt, strs } = require('./utils');
const DEVELOPMENT = 'development';

class App {
    get app() { return this._app; }

    constructor(callback) {
        this.callback = callback;
        const _app = this._app = require('express')();
        _app.disable('x-powered-by')
            .use((req, res, next) => { res.setHeader('Access-Control-Allow-Origin', '*'); next(); })
            .use(require('cors')());
    };

    init() {
        const bodyParser = require('body-parser');
        const cookieParser = require('cookie-parser');
        this._app
            .use(bodyParser.urlencoded({ extended: true }))
            .use(bodyParser.json())
            .use(cookieParser());
        return this;
    };

    async db() {
        if (this._db) return;
        const self = this;
        return require('./db').init(async (err, db) => {
            if (err) return console.error(err);
            this._db = db;
            this._app.use(require('express-session')({
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
            }));
            return self;
        });
    };

    auth() {
        this._app.use(require('express-openid-connect').auth({
            authRequired: false,
            auth0Logout: true,
            secret: process.env.OAUTH_SECRET,
            baseURL: process.env.BASE_URL,
            clientID: process.env.OAUTH_ID,
            issuerBaseURL: process.env.OAUTH_URL
        }));
        return this;
    };

    mockAuth(mocker) {
        let loggedin = 1;
        let account =  { type: 'ADMIN' };

        let locals = {
            loggedin,
            account
        };

        this._app.use((req, res, next) => {
            res.locals.mock = true;
            for(const [k,v] of Object.entries(locals)) res.locals[k] = v;
            next();
        });

        mocker.SetLocals = function(_locals) {
            locals = _locals;
        }

        return this;
    };

    routes() {
        const router = require('./routes');
        this._app
            .use(handleErrors(verifyJwt))
            .use(handleErrors(router))
            .use((req, res, next) => next({ status: 404, message: '404' }))
            .use((err, req, res, next) => {
                if (next.shutupeslint) next;
                if (process.env.NODE_ENVIRONMENT === DEVELOPMENT) console.log('Unknown path accessed: ' + req.originalUrl);
                if (err.status === 401) err.message = strs.Unauthorized;
                else if (err.status !== 404) {
                    console.error(`An error occured whilst accessing "${req.originalUrl}":`, err.message);
                    console.dir(err);
                    err.message = strs.RequestErr;
                }
                res.status(err.status ?? 500).send(err.message);
            });
        return this;
    };

    listen(port, cb) {
        this._app.listen(port, cb);
    };

    static async launch() {
        const app = new App();
        await app.init();
        await app.db();
        await app.auth();
        await app.routes();
        await app.listen(process.env.PORT, () => console.log(strs.Connected));
    };
};

module.exports = App;
