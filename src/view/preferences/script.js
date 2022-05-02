const closeapp = document.getElementById("btn-closeapp")

let name = document.getElementById("username")
let showCompleted = document.getElementById("showcompleted")
let showOverdue = document.getElementById("showoverdue")
let backup = document.getElementById("dobackup")
let allowNotifs = document.getElementById("shownotify")
let notifinterval = document.getElementById("notifinterval")
let timefrom = document.getElementById("timefrom")
let timeto = document.getElementById("timeto")
let btnimport = document.getElementById("import")
let btnexport = document.getElementById("export")
let btnsave = document.getElementById("save")

const { ipcRenderer } = require("electron")
const fs = require("fs")
const { format } = require("path")

//const DataStore = require("../../lib/storer/storer").DataStore;
//const store = new DataStore();
const locale = "win-pref-script";
const time = require("../../lib/timer/timer");

// misc formatting functions

function log(data) {
    ipcRenderer.send("log", data, locale);
}

function addSpaces(str) {
    // replace "-" with " "
    return str.replace(/-/g, " ")
}

function closePref() {
    log("\"closePref\" was clicked")
    if (confirm("Are you sure?")) {
        ipcRenderer.send("win-close")
        ipcRenderer.send("form-close")
        return true
    } 
}

function getPrefData(){
    log(backup.checked)
    return {
        name: name.value,
        showCompleted: showCompleted.checked,
        showOverdue: showOverdue.checked,
        backup: backup.checked,
        notify: {
            enabled: allowNotifs.checked,
            onStartup: allowNotifs.checked,
            interval: notifinterval.value,
            from: timefrom.value,
            to: timeto.value
        }
    }
}

function submitPref() {
    log("\"submitPref\" was clicked")
    let data = getPrefData()
    if (data === undefined) {
        return
    }

    ipcRenderer.send("pref-save", data)
    ipcRenderer.send("form-close")
    ipcRenderer.send("win-close")
    return data
}


// basic window functions


closeapp.addEventListener("click", () => {
    log("\"closeapp\" was clicked")
    closePref()
})


btnsave.addEventListener("click", (e) => {
    log("\"subtask\" was clicked")
    // if e does not return a value, then the form is empty and prevents the task from being added
    if (submitPref()) {
        log("setting pref data")
    } else {
        e.preventDefault()
    }
})

btnexport.addEventListener("click", () => {
    log("\"export\" was clicked")
    if (confirm("Export preferences?")) {
        log("exporting pref data")
        ipcRenderer.send("export-open")
        ipcRenderer.send("form-close")
        ipcRenderer.send("win-close")
    } else {
        e.preventDefault()
    }
})

btnimport.addEventListener("click", () => {
    log("\"import\" was clicked")
    if (confirm("Import preferences?")) {
        log("importing pref data")
        ipcRenderer.send("import-open")
        ipcRenderer.send("form-close")
        ipcRenderer.send("win-close")
    } else {
        e.preventDefault()
    }   
})


// show/hide task input (and other keybinds)

document.addEventListener("keydown", (e) => {
   // log the current key

})


// on "pref-init" set form fields to values provided
ipcRenderer.on("pref-init", (e, data) => {
    log(JSON.stringify(data))
    if (data == null || data == undefined) {
        return
    }

    log("\"pref-init\" was received")
    name.value = data.name
    showCompleted.checked = data.showCompleted
    showOverdue.checked = data.showOverdue
    backup.checked = data.backup
    allowNotifs.checked = data.notify.enabled
    notifinterval.value = data.notify.interval
    timefrom.value = data.notify.from
    timeto.value = data.notify.to

})


ipcRenderer.on("test", (e, data) => {
    log("test")
    console.log(data)
});
