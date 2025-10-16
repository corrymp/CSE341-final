const mongoose = require('mongoose');
require('dotenv').config();
let db;
function init(cb) {
    if (db) return console.warn('Database already initialized: `.init()` should only be called once'), cb(null, db);
    mongoose.connect(process.env.DB_STRING).then(c => cb(null, (db = c))).catch(err => cb(err));
}
function get() { if (db) return db; throw Error('Database not initialized: must call `.init()` before `.get()`'); }
module.exports = { init, get };
