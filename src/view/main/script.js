const minmax = document.getElementById("btn-minmax")
const reduce = document.getElementById("btn-reduce")
const closeapp = document.getElementById("btn-closeapp")
const closeform = document.getElementById("inp-taskclose")
const taskheading = document.getElementById("inp-taskname")
const taskinp = document.getElementById("cntr-taskinp")

const { ipcRenderer } = require("electron")
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

function FormToggle () {
    let current = taskinp.style.display;
    if (current === "none") {
        FormClose();
    } else {
        FormOpen();
    } 
}

function FormClose() {
    taskinp.style.display = "none";
}

function FormOpen(data) {
    taskinp.style.display = "block";
    taskheading.focus();
    // if heading does not exist, do nothing
    if (data === undefined) {
        console.log("data is undefined")
        document.getElementById("inp-taskname").value = "";
        document.getElementById("inp-taskfor").value = "";
        document.getElementById("inp-taskdesc").value = "";
        document.getElementById("inp-taskdate").value = "";
        return;
    } else {
        try {
            log(data.heading, locale)
            document.getElementById("inp-taskname").value = data.heading;
            document.getElementById("inp-taskfor").value = data.whoFor;
            document.getElementById("inp-taskdesc").value = data.description;
            document.getElementById("inp-taskdate").value = data.dueDate;
        } catch (err) {
        }
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
        FormOpen();
        
    }
    
    // listen for escape key and if task form open, close it
    if (e.keyCode === 27) {
        log("ESC pressed", locale)
        if (taskinp.style.display === "block") {
            FormClose();
        }
    }
})


// sets form data

ipcRenderer.on("got-task", (e, data) => {
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
    ipcRenderer.send("task-exists", heading)
    if (heading === "" || heading === undefined) {
        return
    }

    ipcRenderer.on("task-exists-response", (e, data) => {
        if (data == true) {
            log("getting heading " + heading, locale)
            ipcRenderer.send("fetch-task", heading)
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

