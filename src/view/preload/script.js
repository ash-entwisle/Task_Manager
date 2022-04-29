// get "load" and "splash" elements
const load = document.getElementById("load").innerHTML
const splash = document.getElementById("splash").innerHTML
// import IPC and splash
const { ipcRenderer } = require("electron")
const getSplash = require("../../lib/splasher/splasher.js").getSplash;

// log function
function log(data) {
    ipcRenderer.send("log", data, "win-load-script");
}

// change splash text to getSplash() every x ammount of time
splash = getSplash();
const splashInterval = setInterval(() => {splash = getSplash();
}, 2000);

// animate the ... in load
const loadInterval = setInterval(() => {
    if (load == "Loading...") {load = "Loading";} 
    else {load = html + ".";}
}, 500);
