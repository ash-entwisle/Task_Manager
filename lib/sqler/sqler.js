const logger = require('../logger/logger')
let locale = "DB"
const sql = require('sqlite3')

const db = new sql.Database('.../data/db/tasks.db', (err) => {if (err) {
    logger(err, locale)
    }
    logger("connection made", locale)
});

