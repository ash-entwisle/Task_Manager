const load = document.getElementById("load")
const splash = document.getElementById("splash")

const { ipcRenderer } = require("electron")

const getSplash = require("../../lib/splasher/splasher.js").getSplash;
const locale = "win-load-script";

function log(data, locale) {
    ipcRenderer.send("log", data, locale);
}

// change splash text to getSplash() every x ammount of time
splash.innerHTML = getSplash();
const splashInterval = setInterval(() => {
    let data = getSplash();
    splash.innerHTML = data;
    log(`SplashText: ${data}`, locale)
}, 2000);

// animate the ... in load
const loadInterval = setInterval(() => {
    let html = load.innerHTML;
    if (html == "Loading...") {
        load.innerHTML = "Loading";
    } else {
        load.innerHTML = html + ".";
    }
}, 500);
