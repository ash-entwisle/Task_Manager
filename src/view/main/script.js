const minmax = document.getElementById("btn-minmax")
const reduce = document.getElementById("btn-reduce")
const closeapp = document.getElementById("btn-closeapp")
const closeform = document.getElementById("inp-taskclose")
const taskheading = document.getElementById("inp-taskname")
const taskinp = document.getElementById("cntr-taskinp")

const { ipcRenderer, BrowserWindow, ipcMain } = require("electron")
const fs = require("fs")
const { format } = require("path")

//const DataStore = require("../../lib/storer/storer").DataStore;
//const store = new DataStore();
const getSplash = require("../../lib/splasher/splasher.js").getSplash;
const locale = "win-main-script";
const time = require("../../lib/timer/timer");

// misc formatting functions

function log(data, locale) {
    ipcRenderer.send("log", data, locale);
}

function addSpaces(str) {
    // replace "-" with " "
    return str.replace(/-/g, " ")
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

closeform.addEventListener("click", () => {
    log("\"closeForm\" was clicked")
    // confirm that the user wants to close the form
    if (confirm("Are you sure?")) {
        FormClose();
    } else {
        return
    }
})

// show/hide task input (and other keybinds)

document.addEventListener("keydown", (e) => {
    // listen for CTRL+N and then show the new task form
    if (e.ctrlKey && e.keyCode === 78) {
        log("CTRL+N pressed", locale)
        ipcRenderer.send("form-open")
                
    }
    
})


// IPC commands

ipcRenderer.on("pref-init", (e, data) => {
    log("pref-init", locale)
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

