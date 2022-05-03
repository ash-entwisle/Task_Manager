let fs = require('fs')                                      // import fs
const log= require('../logger/logger').log                  // import log function
const locale = "JSON"                                       // set the locale

function exportJSON (path, obj) {                           // export the json
    try {                                                   // try,
        fs.writeFileSync(path, JSON.stringify(obj))         // write the json to the file
    } catch (error) {                                       // if err    
        log("error in exporting object to json", locale)    // log the error
    }
}

function importJSON (targetPath) {                          // import the json
    try {                                                   // try,
        let data = fs.readFileSync(targetPath)              // read the file
        return JSON.parse(data)                             // return parsed json
    } catch (error) {                                       // if err      
        log("error in importing json", locale)              // log the error
    }
}

module.exports = {  exportJSON, importJSON }                // export the functions

