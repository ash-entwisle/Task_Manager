const { BrowserWindow } = require('electron');                                      // import BrowserWindow
const path = require('path');                                                       // import path                                            
const log = require('../logger/logger').log                                         // import log function
let locale = "renderer"                                                             // set locale


function windowTemplate(win, width, height, hidden) {                               // create a window template                
    if (BrowserWindow.getAllWindows().length > 1) {return}                          // if there are already windows open, return
    let window = new BrowserWindow({                                                // create a new window                      
        width: width, height: height, minWidth: width, minHeight: height,           // set the width and height, and min width and height
        webPreferences: { nodeIntegration: true, contextIsolation: false },         // set the webPreferences
        autoHideMenuBar: true, frame: false, show: hidden,
        icon: path.join(__dirname, "../../assets/app.ico" )                         // set the autoHideMenuBar, frame, and show
    });
    window.loadFile(path.join(__dirname, `../../view/${win}/index.html`));          // load the html file
    window.on('closed', () => { window = null; log(`${win} closed`, locale) });     // on window closed, set window to null
    window.on('ready-to-show', () => { log(`${win} ready`, locale) });              // on window ready, log ready
    log(`window created: ${win}`, locale)
    return window;                                                                  // return the window          
}

function createForm() {return windowTemplate("form", 600, 400, true)}               // template for the form window
function createSplash() {return windowTemplate("preload", 400, 200, true);}         // template for the splash window
function createMain() {return windowTemplate("main", 800, 650, false);};            // export the window templates
function createPref() {return windowTemplate("preferences", 600, 500, true);}       // export the window templates


module.exports = { createMain, createForm, createSplash, createPref }               // export the window templates






