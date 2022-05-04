const minmax = document.getElementById("btn-minmax")                    // minmax button
const reduce = document.getElementById("btn-reduce")                    // reduce button
const closeapp = document.getElementById("btn-closeapp")                // close app button
const newbtn = document.getElementById("btn-new")                       // new button
const cogbtn = document.getElementById("btn-cog")                       // cog button

const { ipcRenderer } = require("electron")                             // import ipcRenderer
const locale = "win-main-script";                                       // locale
const timer = require("../../lib/timer/timer");                         // import timer


// ===== Miscellaneous =====

function log(data, locale) {ipcRenderer.send("log", data, locale);}     // log to main process

function addSpaces(str) {return str.replace(/-/g, " ")}                 // add spaces to string

function err(msg) {                                                     // error message
    log("notify")       
    const notify = new Notification("Error:", {                         // create notification
        body: msg, requireInteraction: false                            // set data
    })
}


// ===== Button Events =====

closeapp.addEventListener("click", () => {                              // close app button
    log("\"closeapp\" was clicked")
    ipcRenderer.send("app-close")                                       // send close app event
})

reduce.addEventListener("click", () => {                                // reduce button
    log("window reduced")
    ipcRenderer.send("app-reduce")                                      // send reduce event
})

minmax.addEventListener("click", () => {                                // minmax button
    log("window minmaxed")
    ipcRenderer.send("app-minmax")                                      // send minmax event
})

newbtn.addEventListener("click", () => {                                // new button
    log("opening form from btn")
    ipcRenderer.send("form-open")                                       // send open form event
})

cogbtn.addEventListener("click", () => {                                // cog button
    log("opening preferences from btn")
    ipcRenderer.send("pref-open")                                       // send open pref event
})

document.addEventListener("keydown", (e) => {                           // keydown event
    if (e.ctrlKey && e.keyCode === 78) {                                // if CTRL+N
        log("CTRL+N pressed", locale)
        ipcRenderer.send("form-open")                                   // send open form event
                
    }/*
    if (e.ctrlKey && e.shiftKey && e.keyCode === 69) {                  // if CTRL+SHIFT+E
        log("CTRL+SHIFT+E pressed", locale)
        ipcRenderer.send("export-open")                                 // send open export event
    }*/ /*
    if (e.ctrlKey && e.shiftKey && e.keyCode === 88) {                  // if CTRL+SHIFT+X
        log("CTRL+SHIFT+O pressed", locale)
        ipcRenderer.send("import-open")                                 // send open import event
    }*/
    if (e.ctrlKey && e.shiftKey && e.keyCode === 80) {                  // if CTRL+SHIFT+P
        log("CTRL+SHIFT+P pressed", locale)
        ipcRenderer.send("pref-open")                                   // send open pref event
    }
})

document.addEventListener("dblclick", (e) => {                          // dblclick event
    let heading = addSpaces(e.target.id);                               // get heading
    log(`looking for ${heading}`, locale)                               // checkif heading is found
    if (heading === "" || heading === undefined || heading === null || heading === "undefined" || heading === "null") {
        return                                                          // if not found, return
    }
    log(`"opening form: ${heading}"`)
    ipcRenderer.send("form-open", heading)                              // send open form event 
    heading = null                                                      // clear heading
})


// ===== IPC Events =====

ipcRenderer.on("init", (e, data) => {                                   // init event
    log("\"init\" was received")                                        // 
    if (data.notify.enabled) {                                          // if notify is enabled
        ipcRenderer.send("notify");                                     // send notify event
        setInterval(() => {                                             // start timer   
            let now = timer.getFormatTime();                            // get time
            if (now >= data.notify.from && now <= data.notify.to && data.notify.enabled) {
                ipcRenderer.send("notify")                              // if time is between from and to, send notify event
            }},  data.notify.interval * 60000                           // wait for interval minutes
        )
    }
})


ipcRenderer.on("error", (e, data) => {err(data)})                       // error event

ipcRenderer.on("notify-r", (e, data) => {                               // on notify received
    log("notify time")
    const notify = new Notification("Notification:", {                  // create notification
        body: `Hey ${data.name}! You have ${data.incomplete} tasks to complete and ${data.overdue} tasks overdue.`,
        requireInteraction: false
    })
    notify.onclick = () => {                                            // on click
        log("notify clicked")
        ipcRenderer.send("focus")                                       // send focus event
    }
})

ipcRenderer.on("test", (e, data) => {console.log(data)});               // test event
