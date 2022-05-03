const fs = require('fs')                                                // import fs
const time = require('../timer/timer')                                  // import time                   

// log function
function log(action, locale) {
    let data = (`[${time.getFormatDateTime()}]: ${action} (${locale})`) // format the data
    let logpath = "./src/data/logs/" + time.getFormatDate() + ".log"    // set the path and filename
    try {fs.appendFileSync(logpath, ('\n' + data));}                    // try to append the data to the log file
    catch (err) {console.error(err);};                                  // if err, log err
    console.log(data)                                                   // log the data to the console
};

module.exports = { log }                                                // export the log function
