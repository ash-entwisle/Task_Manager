const fs = require('fs')
const path = require('path')
const time = require('../timer/timer')


function logger(action, locale) {

    let data = (`[${time.getFormatDateTime()}]: ${action} (${locale})`)
    let logpath = "./src/data/logs/" + time.getFormatDate() + ".log"

    try {
        fs.appendFileSync(logpath, ('\n' + data));
    } catch (err) {
        console.error(err);
    };
        
    console.log(data)
    };

module.exports = logger
