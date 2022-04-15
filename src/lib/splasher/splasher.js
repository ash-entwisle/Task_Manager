const fs = require('fs');
const log = require('../logger/logger').log
let locale = "splasher"

function getSplash() {
    
    try {
        const data = fs.readFileSync('./src/data/splash/splash.txt', 'UTF-8');
        const lines = data.split(/\r?\n/);
        let splash = lines[Math.floor(Math.random() * lines.length)]
        log("New Splash - " + splash, locale)
        return splash
        
    } catch (err) {
        console.error(err);
    }
}

module.exports = { getSplash }