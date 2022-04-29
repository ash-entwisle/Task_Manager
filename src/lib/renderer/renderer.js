const { app, BrowserWindow } = require('electron');
const path = require('path');

const log = require('../logger/logger').log
let locale = "renderer"

// tenplate window create function
function windowTemplate(win, width, height, hidden) {
    // Create the browser window.
    let window = new BrowserWindow({ 
        width: width, height: height, minWidth: width, minHeight: height,
        webPreferences: { nodeIntegration: true, contextIsolation: false },
        autoHideMenuBar: true, frame: false, show: hidden
    });
    // load html
    window.loadFile(path.join(__dirname, `../../view/${win}/index.html`));
    // window on events
    window.on('closed', () => { window = null; log(`${win} closed`, locale) });
    window.on('ready-to-show', () => { log(`${win} ready`, locale) });
    // log and return window
    log(`window created: ${win}`, locale)
    return window;
}

// functions to create windows based on template above

function createForm() {return windowTemplate("form", 600, 400, true)}
function createSplash() {return windowTemplate("preload", 400, 200, true);}
function createMain() {return windowTemplate("main", 800, 600, false);};


module.exports = { createMain, createForm, createSplash }






