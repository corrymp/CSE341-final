if (!process.env.ENV_LOADED) require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const jwt = require('jsonwebtoken');
const { param, validationResult } = require('express-validator');
const DEVELOPMENT = 'development';

const strs = {
    Connected: `database conected - app listening on ${process.env.HOST}:${process.env.PORT}`,
    Unauthorized: 'Unauthorized - please authenticate',
    RequestErr: 'An error occured whilst fulfilling the request.',
    Denied: 'Access Denied',

    Campaign: {
        Updated: 'Campaign updated',
        Deleted: 'Campaign, codes, and resources deleted',
        Unknown: 'Unknown campaign'
    },

    Resource: {
        Updated: 'Resource updated',
        Deleted: 'Resource deleted',
        Unknown: 'Unknown resource',
        UsedByCode: 'Can not delete a resource that currently has codes pointed to it',
        UsedByCampaign: 'Can not delete a resource that is currently set as the campaign invalid_code',
        UpdateHomeCampaign: 'updates to `home_campaign` are forbidden. Instead, recreate the resource in the new campaign'
    },

    Code: {
        Updated: 'Code updated',
        Deleted: 'Code deleted',
        Unknown: 'Unknown code',
        Exists: 'A of that sequence already exists',
        UpdateHomeCampaign: 'updates to `home_campaign` are forbidden. Instead, recreate the code in the new campaign'
    },

    User: {
        Updated: 'User updated',
        Deleted: 'User deleted',
        Unknown: 'Unknown user',
        AlreadyManager: 'User is already a manager of that campaign',
        MadeManager: 'User management permissions assigned',
        NotManager: 'User is not a manager of that campaign',
        RemoveManager: 'User management permissions revoked',
        PermissionsChanged: 'Management permissions moved',
        PossibleIDSwap: 'User is not a manager of that campaign, and is already a manager of the other. You may have gotten the IDs backwards.'
    },

    Theme: {
        Updated: 'Theme updated',
        Deleted: 'Theme deleted',
        Unknown: 'Unknown theme',
        Exists: 'A theme of that name already exists',
        UsedByCampaign: 'Must change themes of all campaigns with this theme before removing'
    }
};

/**
 * @description creates two objects: StatusCodes, and cannedResponse
 * @property {object} StatusCodes - mapping of HTTPStatus code names to numbers; also includes code classifications for easier reference
 * @property {object} cannedResponse - object containing methods accepting a response object; when called, sets the response status to the given code and returns a passed JSON object, or if a string was passed a new object with the key of `message` and a value of the string, or if nothing was passed the response name will be sent as the message
 */
const { StatusCodes, cannedResponse } = (StatusCodes => {
    const cannedResponse = {};
    const regRep = (_, a, b, c, d, e, f) => (a ? a : '') + (a && b ? ' ' : '') + (b ? b : '') + (b && c ? ' ' : '') + (c ? c : '') + (c && d ? ' ' : '') + (d ? d : '') + (d && e ? ' ' : '') + (e ? e : '') + (e && f ? ' ' : '') + (f ? f : '');
    for (const resType of Object.values(StatusCodes))
        for (const [codeName, code] of Object.entries(resType)) {
            const splitName = codeName.replace(/^(?:.+_)?([A-Z]*)([A-Z][a-z]+)([A-Z][a-z]+)?([A-Z][a-z]+)?([A-Z][a-z]+)?([A-Z][a-z]+)?/g, regRep);
            StatusCodes[codeName] = code;
            cannedResponse[codeName] = cannedResponse[code] = (res, msg) => res.status(code).json(typeof msg === 'object' ? msg : { message: msg ?? splitName });
        }
    return { StatusCodes, cannedResponse };
})({
    info: {
        Continue: 100,
        SwitchingProtocols: 101,
        Processing: 102,
        EarlyHints: 103
    },
    success: {
        OK: 200,
        Created: 201,
        Accepted: 202,
        NonAuthoritativeInformation: 203,
        NoContent: 204,
        ResetContent: 205,
        PartialContent: 206,
        MultiStatus: 207,
        AlreadyReported: 208,
        IMUsed: 226
    },
    redirect: {
        MultipleChoices: 300,
        MovedPermanently: 301,
        Found: 302,
        SeeOther: 303,
        NotModified: 304,
        deprecated_UseProxy: 305,
        reserved_usused: 306,
        TemporaryRedirect: 307,
        PermanentRedirect: 308
    },
    userError: {
        BadRequest: 400,
        Unauthorized: 401,
        PaymentRequired: 402,
        Forbidden: 403,
        NotFound: 404,
        MethodNotAllowed: 405,
        NotAcceptable: 406,
        ProxyAuthenticationRequired: 407,
        RequestTimeout: 408,
        Conflict: 409,
        Gone: 410,
        LengthRequired: 411,
        PreconditionFailed: 412,
        ContentTooLarge: 413,
        URITooLong: 414,
        UnsupportedMediaType: 415,
        RangeNotSatisfiable: 416,
        ExpectationFailed: 417,
        Imateapot: 418,
        MisdirectedRequest: 421,
        UnprocessableContent: 422,
        Locked: 423,
        FailedDependency: 424,
        TooEarly: 425,
        UpgradeRequired: 426,
        PreconditionRequired: 428,
        TooManyRequests: 429,
        RequestHeaderFieldsTooLarge: 431,
        UnavailableForLegalReasons: 451
    },
    serverError: {
        InternalServerError: 500,
        NotImplemented: 501,
        BadGateway: 502,
        ServiceUnavailable: 503,
        GatewayTimeout: 504,
        HTTPVersionNotSupported: 505,
        VariantAlsoNegotiates: 506,
        InsufficientStorage: 507,
        LoopDetected: 508,
        NotExtended: 510,
        NetworkAuthenticationRequired: 511
    }
});

const UserTypes = {
    VIEWER: 'VIEWER',
    ORGANIZER: 'ORGANIZER',
    ADMIN: 'ADMIN'
};

const UserPermLevels = {
    VIEWER: 1,
    ORGANIZER: 2,
    ADMIN: 3,
    1: UserTypes.VIEWER,
    2: UserTypes.ORGANIZER,
    3: UserTypes.ADMIN
};

/** @description changes swagger.json to include dev values */
const getSwaggerJson = (() => {
    const json = require('./swagger.json');

    if (process.env.NODE_ENVIRONMENT === DEVELOPMENT) json.servers[0].url = `${process.env.SCHEME}://${process.env.HOST}:${process.env.PORT}`;

    return () => json;
})();

/**
 * @description mutates the passed campaign array to remove non-essential values (_id, open/close_at, invalid_code, etc)
 * @param {Object[]} campaigns - list of campaigns
 * @returns {Object[]} original list modified to only include certain values
 */
function sanitizeCampaigns(campaigns) {
    for (let i = 0; i < campaigns.length; i++) {
        const campaign = campaigns[i];
        campaigns[i] = {
            title: campaign.title,
            theme: campaign.theme,
            base_url: campaign.base_url,
            summary: campaign.summary
        };
    }
    return campaigns;
}

/**
 * @description takes a string and schema and returns a number signifying whether it is an id or name or neither
 * @param {String} idOrName - potential ID of name to check
 * @param {Object} type - Mongoose schema to look in
 * @param {String} specialSearch - search term to use instead of `name`
 * @returns {Object} obj with a result and an id - result: 1 if id, -1 if name, 0 if neither; id: id if found, null if not
 */
async function resolveToIdOrName(idOrName, type, specialSearch) {
    try {
        let result;

        // valid ID: check for item of type with ID
        if (ObjectId.isValid(idOrName)) result = await type.findById(idOrName);

        // results found: is an ID
        if (result && result._id) return { result: 1, id: result._id };

        // invalid ID or no results: check for item of type with name (or special search term)
        if (specialSearch) result = await type.findOne({ [specialSearch]: idOrName });
        else result = await type.findOne({ name: idOrName });

        // results found: was a name/special:
        if (result && result._id) return { result: -1, id: result._id };

        // no results: not an ID or name/special
        return { result: 0, id: null };
    } catch (e) {
        console.error(`Trouble resolving id/${specialSearch ?? 'name'}: ${idOrName}, ${e.message}`);
        return { result: 0, id: null };
    }
}

//#region validation
function validator(req, res, next) {
    let result = validationResult(req);
    if (result.isEmpty()) return next();
    if (process.env.NODE_ENVIRONMENT === DEVELOPMENT) console.dir(result.errors);
    cannedResponse.NotAcceptable(res, { errors: prettifyErrors(result.errors) });
}

const prettifyErrors = errors => errors.map(err => `${err.path}: ${err.msg} "${parseObj(err.value)}"`).join('; ');

function parseObj(obj) {
    if (typeof obj !== 'object') return obj;
    const a = Array.isArray(obj);
    let res = a ? '[' : '{';
    for (const [k, v] of Object.entries(obj)) {
        res += a ? '' : `${k}: `;
        if (typeof v === 'object') res += parseObj(v);
        else res += v;
        res += ', ';
    }
    return res + (a ? ']' : '}');
}

const sanitize = val => param(val).optional().trim().notEmpty();

// General validator that checks that query params are valid IDs and such
validator.path = () => [sanitize('id').isMongoId(), sanitize('id2').isMongoId(), sanitize('id3').isMongoId(), sanitize('code').isLength({ min: 1, max: 31 }), sanitize('baseUrl').isLength({ min: 3, max: 15 })];
//#endregion validation

//#region authentiction
/**
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next callback
 * @description verifies authenticity of JWT; pass: calls next function; else: redirect to login
 */
function verifyJwt(req, res, next) {
    if (!req.cookies.jwt) return next();
    jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
        if (err) {
            res.clearCookie('jwt');
            cannedResponse.Unauthorized(res, strs.Unauthorized);
            return;
        }
        res.locals.loggedin = 1;
        res.locals.account = data;
    });
    next();
}

/**
 * @param {Response} res - Express response object
 * @param {Object} accountData - Data of account
 * @param {Function} cb - callback function
 * @param {Number} duration - time till cookie expires in miliseconds; default: 1 hour
 * @description issue new JsonWebToken
 */
function grantJwt(res, data, cb, duration = 3600000) {
    res.cookie('jwt', jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: duration }), { httpOnly: true, maxAge: duration, secure: process.env.NODE_ENV !== DEVELOPMENT });
    res.locals.loggedin = 1;
    res.locals.account = data;
    if (cb) cb();
}

function requiredPermissionLevel(level, allowSelf = false) {
    if (typeof level === 'number') level = UserPermLevels[level];

    if (!UserTypes[level]) throw `Invalid user type passed. Correct imediately. Must be one of ${Object.keys(UserTypes).join(', ')}`;

    const minPermLevel = UserPermLevels[level];

    return (req, res, next) => {
        if (process.env.NODE_ENVIRONMENT === DEVELOPMENT) console.log('checking permissions level. Needed level: ' + level + '. Has: ' + res.locals?.account?.type);
        if (!res.locals.loggedin) return cannedResponse.Unauthorized(res, strs.Unauthorized);

        const type = res.locals?.account?.type;
        const permLevel = UserPermLevels[type] ?? 0;

        if (allowSelf && res.locals?.account?._id === req.params.id) return next();

        if (permLevel < minPermLevel) return cannedResponse.Forbidden(res, strs.Denied);
        next();
    };
}

//#endregion authentication

const handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = {
    StatusCodes,
    cannedResponse,
    UserTypes,
    getSwaggerJson,
    sanitizeCampaigns,
    resolveToIdOrName,
    validator,
    prettifyErrors,
    handleErrors,
    verifyJwt,
    grantJwt,
    requiredPermissionLevel,
    strs
};
