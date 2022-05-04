const { ipcRenderer } = require("electron")                                 // import ipcRenderer
const getSplash = require("../../lib/splasher/splasher.js").getSplash;      // get splash

let splash = document.getElementById("splash")                              // get splash
let load = document.getElementById("load")                                  // get load

function log(data) {ipcRenderer.send("log", data, "win-load-script");}      // log to main process

splash.innerHTML = getSplash();                                             // initialize splash

const splashInterval = setInterval(() => {splash.innerHTML = getSplash();   // every 2 seconds, update splash
}, 2000);

const loadInterval = setInterval(() => {                                    // every 0.5 seconds, update load
    if (load.innerHTML == "Loading...") {load.innerHTML = "Loading";}       // animate Loading Loading. Loading.. Loading...
    else {load.innerHTML += ".";}   
}, 500);
