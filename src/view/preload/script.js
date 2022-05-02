// get "load" and "splash" elements
let load = document.getElementById("load")
let splash = document.getElementById("splash")
// import IPC and splash
const { ipcRenderer } = require("electron")
const getSplash = require("../../lib/splasher/splasher.js").getSplash;

// log function
function log(data) {
    ipcRenderer.send("log", data, "win-load-script");
}

// change splash text to getSplash() every x ammount of time
splash.innerHTML = getSplash();
const splashInterval = setInterval(() => {splash.innerHTML = getSplash();
}, 2000);

// animate the ... in load
const loadInterval = setInterval(() => {
    if (load.innerHTML == "Loading...") {load.innerHTML = "Loading";} 
    else {load.innerHTML += ".";}
}, 500);
