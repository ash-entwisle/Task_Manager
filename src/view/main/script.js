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



// misc toggle functions

function createForm() {
    return new BrowserWindow({
        width: 400,
        height: 200,
        frame: false,
        resizable: false,
        openDevTools: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
}

function OpenForm(data) {
    // create form window
    let form = createForm()
    form.loadFile(format(__dirname, "./view/form/index.html"))

    // gets task data from main
    ipcRenderer.send("task-fetch", data.heading)

    // on response, send data to task-
    ipcRenderer.on("task-fetch-r", (e, data) => {
        form.webContents.send("task-init", data)
    })

    return form
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


// sets form data

ipcRenderer.on("task-fetch-response", (e, data) => {
    log("got task", locale)
    //console.log(data)
    // set the form to open
    FormOpen(data);

});

// checks if anything but the form is clicked, then toggles the form

document.addEventListener("click", (e) => {
    let target = e.target.id;
    //console.log(target)
})

// checks for any doubleclicks on a task and then opens the form for editing

document.addEventListener("dblclick", (e) => {
    let heading = addSpaces(e.target.id);
    log(`looking for ${heading}`, locale)
    // check if heading is in tasklist
    ipcRenderer.send("task-check", heading)
    if (heading === "" || heading === undefined) {
        return
    }

    ipcRenderer.on("task-check-r", (e, check) => {
        if (check == true) {
            log("getting heading " + heading, locale)
            // get form data
            ipcRenderer.send("task-fetch", heading)
            // on response, launch form with data
            ipcRenderer.on("task-fetch-r", (e, data) => {
                log("got task", locale)
                // open form
                let form = OpenForm(data)
            })
        } else {
            log("task does not exist", locale)
        }
    })
})



// ipc test function (pingpong)

ipcRenderer.on("test", (e, data) => {
    log("test", locale)
    console.log(data)
});


