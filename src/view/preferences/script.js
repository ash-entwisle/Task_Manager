const closeapp = document.getElementById("btn-closeapp")                // close app button

let name = document.getElementById("username")                          // username input
let showCompleted = document.getElementById("showcompleted")            // show completed checkbox
let showOverdue = document.getElementById("showoverdue")                // show overdue checkbox
let backup = document.getElementById("dobackup")                        // backup checkbox
let allowNotifs = document.getElementById("shownotify")                 // allow notifications checkbox
let notifinterval = document.getElementById("notifinterval")            // notification interval input
let timefrom = document.getElementById("timefrom")                      // time from input
let timeto = document.getElementById("timeto")                          // time to input
let btnimport = document.getElementById("import")                       // import button
let btnexport = document.getElementById("export")                       // export button
let btnsave = document.getElementById("save")                           // save button

const { ipcRenderer } = require("electron")                             // import ipcRenderer

// ===== Misc functions =====

function log(data) {ipcRenderer.send("log", data, "win-pref-script");}  // log to main process

function closePref() {                                                  // close pref
    log("\"closePref\" was clicked")
    if (confirm("Are you sure?")) {                                     // confirm close
        ipcRenderer.send("win-close")                                   // send close event
        ipcRenderer.send("form-close")                                  // send close event
        return true                                                     // return true
    } 
}

function getPrefData(){                                                 // get pref data
    return {                                                            // return data
        name: name.value,                                               // username
        showCompleted: showCompleted.checked,                           // show completed
        showOverdue: showOverdue.checked,                               // show overdue
        backup: backup.checked,                                         // backup
        notify: {
            enabled: allowNotifs.checked,                               // allow notifications
            onStartup: allowNotifs.checked,                             // on startup
            interval: notifinterval.value,                              // interval
            from: timefrom.value,                                       // from
            to: timeto.value                                            // to
        }
    }
}

function submitPref() {                                                 // submit pref
    log("\"submitPref\" was clicked")                                   
    let data = getPrefData()                                            // get data
    if (data === undefined) {return}                                    // if data is undefined
    ipcRenderer.send("pref-save", data)                                 // send save event
    ipcRenderer.send("form-close")                                      // send close event
    ipcRenderer.send("win-close")                                       // send close event
    return data                                                         // return data
}


// ===== Onclick events =====

closeapp.addEventListener("click", () => {                              // close app button
    log("\"closeapp\" was clicked")
    closePref()                                                         // close pref
})


btnsave.addEventListener("click", (e) => {                              // save button
    log("\"subtask\" was clicked")
    if (submitPref()) {log("setting pref data")}                        // submit pref
    else {e.preventDefault()}                                           // else prevent default
})

btnexport.addEventListener("click", () => {                             // export button
    log("\"export\" was clicked")               
    if (confirm("Export preferences?")) {                               // confirm export
        log("exporting pref data")
        ipcRenderer.send("export-open")                                 // send export event
        ipcRenderer.on("export-r", (e, data) => {                       // on export response
            ipcRenderer.send("form-close")                              // send close event
            ipcRenderer.send("win-close")                               // send close event 
        })
    } else {e.preventDefault()}                                         // else prevent default
})

btnimport.addEventListener("click", () => {                             // import button
    log("\"import\" was clicked")
    if (confirm("Import preferences?")) {                               // confirm import
        log("importing pref data")
        ipcRenderer.send("import-open")                                 // send import event
        ipcRenderer.on("import-r", (e, data) => {                       // on import response
            ipcRenderer.send("form-close")                              // send close event
            ipcRenderer.send("win-close")                               // send close event
        })
    } else {e.preventDefault()}                                         // else prevent default
})


// ===== IPC events =====

ipcRenderer.on("pref-init", (e, data) => {                              // on init event
    log("\"pref-init\" was received")
    if (data == null || data == undefined) {return}                     // if data is undefined

    name.value = data.name                                              // set username to data name
    showCompleted.checked = data.showCompleted                          // set show completed to data showCompleted
    showOverdue.checked = data.showOverdue                              // set show overdue to data showOverdue
    backup.checked = data.backup                                        // set backup to data backup
    allowNotifs.checked = data.notify.enabled                           // set allow notifications to data notify.enabled
    notifinterval.value = data.notify.interval                          // set notification interval to data notify.interval
    timefrom.value = data.notify.from                                   // set time from to data notify.from
    timeto.value = data.notify.to                                       // set time to to data notify.to
})


ipcRenderer.on("test", (e, data) => {console.log(data)});               // test event
