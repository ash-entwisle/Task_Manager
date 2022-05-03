const fs = require('fs');                                               // import fs
const log = require('../logger/logger').log                             // import log function
let locale = "splasher"                                                 // set the locale

function getSplash() {                                                  // get the splash text
    try {                                                               // try to read file
        const data = fs.readFileSync('./src/data/splash/splash.txt', 'UTF-8');
        const lines = data.split(/\r?\n/);                              // split the data into lines       
        let splash = lines[Math.floor(Math.random() * lines.length)]    // get a random line from the array
        log("New Splash - " + splash, locale)                           // log the new splash
        return splash                                                   // return the splash
    } catch  (err) {console.error(err)}                                 // if err, log err
}

module.exports = { getSplash }                                          // export the getSplash function




