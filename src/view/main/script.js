const minmax = document.getElementById("btn-minmax")
const reduce = document.getElementById("btn-reduce")
const closeapp = document.getElementById("btn-closeapp")
const closeform = document.getElementById("inp-taskclose")
const newbtn = document.getElementById("btn-new")
const cogbtn = document.getElementById("btn-cog")

const { ipcRenderer, BrowserWindow, ipcMain, dialog } = require("electron")
const fs = require("fs")
const { format } = require("path")

//const DataStore = require("../../lib/storer/storer").DataStore;
//const store = new DataStore();
const getSplash = require("../../lib/splasher/splasher.js").getSplash;
const locale = "win-main-script";
const timer = require("../../lib/timer/timer");

// misc formatting functions

function log(data, locale) {
    ipcRenderer.send("log", data, locale);
}

function addSpaces(str) {
    // replace "-" with " "
    return str.replace(/-/g, " ")
}

function err(msg) {
    log("notify")
    const notify = new Notification("Error:", {
        body: msg,
        requireInteraction: false
    })
    notify.onclick = () => {
        log("notify clicked")
    }
}



   

// basic window functions


closeapp.addEventListener("click", () => {
    log("\"closeapp\" was clicked")
    ipcRenderer.send("app-close")
})

reduce.addEventListener("click", () => {
    log("window reduced")
    ipcRenderer.send("app-reduce")
})

minmax.addEventListener("click", () => {
    log("window minmaxed")
    ipcRenderer.send("app-minmax")
})

newbtn.addEventListener("click", () => {
    log("opening form from btn")
    ipcRenderer.send("form-open")
})

cogbtn.addEventListener("click", () => {
    log("opening preferences from btn")
    ipcRenderer.send("pref-open")   
})



// show/hide task input (and other keybinds)

document.addEventListener("keydown", (e) => {
    // log(`keydown: ${e.keyCode}`, locale)
    // listen for CTRL+N and then show the new task form
    if (e.ctrlKey && e.keyCode === 78) {
        log("CTRL+N pressed", locale)
        ipcRenderer.send("form-open")
                
    }

    // on ctrl shift e, open export window
    if (e.ctrlKey && e.shiftKey && e.keyCode === 69) {
        log("CTRL+SHIFT+E pressed", locale)
        ipcRenderer.send("export-open")
    }

    // on ctrl shift o, open import window
    if (e.ctrlKey && e.shiftKey && e.keyCode === 88) {
        log("CTRL+SHIFT+O pressed", locale)
        ipcRenderer.send("import-open")
    }

    // on ctrl shift  p , open preferences window
    if (e.ctrlKey && e.shiftKey && e.keyCode === 80) {
        log("CTRL+SHIFT+P pressed", locale)
        ipcRenderer.send("pref-open")
    }

    
})


// IPC commands

ipcRenderer.on("init", (e, data) => {
    log("\"init\" was received")
    log(`notify: ${data.notify.enabled} from: ${data.notify.from} to: ${data.notify.to}`, locale)

    if (data.notify.enabled) {
        ipcRenderer.send("notify");
    }

    setInterval(() => {
        let now = timer.getFormatTime();
        if (now >= data.notify.from && now <= data.notify.to && data.notify.enabled) {
            ipcRenderer.send("notify")
        }
    },
        data.notify.interval * 60000)
})

ipcRenderer.on("error", (e, data) => {
    err(data)    
})

ipcRenderer.on("notify-r", (e, data) => {
    log("notify time")
    const notify = new Notification("Notification:", {
        body: `Hey ${data.name}! You have ${data.incomplete} tasks to complete and ${data.overdue} tasks overdue.`,
        requireInteraction: false
    })
    notify.onclick = () => {
        log("notify clicked")
        ipcRenderer.send("focus")
    }
})


// checks if anything but the form is clicked, then toggles the form

document.addEventListener("click", (e) => {
    let target = e.target.id;
    //console.log(target)
})

// checks for any doubleclicks on a task and then opens the form for editing

document.addEventListener("dblclick", (e) => {
    console.log(e.target.id)
    let heading = addSpaces(e.target.id);
    log(`looking for ${heading}`, locale)
    // check if heading is in tasklist
    if (heading === "" || heading === undefined || heading === null || heading === "undefined" || heading === "null") {
        return
    }
    
    log(`"opening form: ${heading}"`)
    ipcRenderer.send("form-open", heading)
    /*
    ipcRenderer.send("task-check", heading)
    ipcRenderer.on("task-check-r", (e, check) => {
        if (check == true) {
            log("getting heading " + heading, locale)
            // open form with heading
            ipcRenderer.send("form-open", heading)
        } else {
            log("task does not exist", locale)
        }
    })*/
    // clear heading
    heading = null
})



// ipc test function (pingpong)

ipcRenderer.on("test", (e, data) => {
    log("test", locale)
    console.log(data)
});



// if pref.notify.enabled is true, then show a notification every pref.notify.interval
// from the pref.notify.start time to the pref.notify.end time

// check time every min or so, and if it's within the notify time, then show a notification and wait interva