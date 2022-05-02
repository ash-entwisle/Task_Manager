const minmax = document.getElementById("btn-minmax")
const reduce = document.getElementById("btn-reduce")
const closeapp = document.getElementById("btn-closeapp")
//const closeform = document.getElementById("inp-taskclose")

let taskname = document.getElementById("inp-taskname")
let taskfor = document.getElementById("inp-taskfor")
let taskdate = document.getElementById("inp-taskdate")
let taskdesc = document.getElementById("inp-taskdesc")
let oldHeading = document.getElementById("inp-taskname").value
let edit = false
let completed = false

const subtask = document.getElementById("inp-tasksubmit")
const cnltask = document.getElementById("btn-taskcancel")
const deltask = document.getElementById("btn-taskdelete")
const cmptask = document.getElementById("btn-taskcomplete")
const ttltask = document.getElementById("btn-tasktitle")
const ttlwind = document.getElementById("title")



const { ipcRenderer } = require("electron")
const fs = require("fs")
const { format } = require("path")

//const DataStore = require("../../lib/storer/storer").DataStore;
//const store = new DataStore();
const getSplash = require("../../lib/splasher/splasher.js").getSplash;
const locale = "win-form-script";
const time = require("../../lib/timer/timer");

// misc formatting functions

function log(data) {
    ipcRenderer.send("log", data, locale);
}

function addSpaces(str) {
    // replace "-" with " "
    return str.replace(/-/g, " ")
}

function closeForm() {
    log("\"closeForm\" was clicked")
    if (confirm("Are you sure?")) {
        ipcRenderer.send("win-close")
        ipcRenderer.send("form-close")
        return true
    } 
}

function getFormData(complete = false) {

    let data = {
        heading: document.getElementById("inp-taskname").value,
        whoFor: document.getElementById("inp-taskfor").value,
        description: document.getElementById("inp-taskdesc").value,
        setDate: time.getFormatDate(),
        dueDate: document.getElementById("inp-taskdate").value,
        completed: complete
    }

    
    
    
    // make sure setdate and header are not empty
    if (data.heading === "" || data.heading === undefined || data.setDate === "" || data.setDate === undefined) {
        alert("Please enter a task name and set a due date")
        return
    }

    // if heading is empty or already exists, return false
    if (data.heading == "" || data.heading == undefined || data.heading == null) {
        alert("Task name cannot be empty")
        return
    }
    // check if task due date is in the past where date is formatted as YYYY-MM-DD
    if (data.dueDate < data.setDate) {
        alert("Task due date cannot be in the past")
        return
    }
    
    return data
}

function submitForm(complete = false) {
    log("\"submitForm\" was clicked")
    let data = getFormData(complete)
    if (data === undefined) {
        return
    }

    ipcRenderer.send("task-check", oldHeading)
    ipcRenderer.on("task-check-r", (e, exists) => {
        if (exists || data.heading == oldHeading) {
            log("task exists")
            if (confirm(`${data.heading} already exists. Overwrite?`)) {
                ipcRenderer.send("task-edit", data, oldHeading)
                ipcRenderer.send("form-close")
                ipcRenderer.send("win-close")
            } else {
                return
            }
        } else {
            log(`${oldHeading} does not exist`)
            if (confirm("Save Task?")) {
                ipcRenderer.send("task-add", data)
                ipcRenderer.send("form-close")
                ipcRenderer.send("win-close")
            } else {
                return 
            }
        }
    })
    return data
}


// basic window functions


closeapp.addEventListener("click", () => {
    log("\"closeapp\" was clicked")
    closeForm()
})

reduce.addEventListener("click", () => {
    log("window reduced")
    ipcRenderer.send("app-reduce")
})

minmax.addEventListener("click", () => {
    log("window minmaxed")
    ipcRenderer.send("app-minmax")
})

subtask.addEventListener("click", (e) => {
    log("\"subtask\" was clicked")
    // if e does not return a value, then the form is empty and prevents the task from being added
    if (submitForm()) {
        log("adding task")
    } else {
        e.preventDefault()
    }
})

cnltask.addEventListener("click", () => {
    log("\"cnltask\" was clicked")
    closeForm()
})

deltask.addEventListener("click", () => {
    log("\"deltask\" was clicked")
    if (edit === true) {
        if (confirm("Are you sure?")) {
            ipcRenderer.send("task-delete", oldHeading)
            ipcRenderer.send("form-close")
            ipcRenderer.send("win-close")
        }
    } 
})

cmptask.addEventListener("click", (e) => {
    log("\"cmptask\" was clicked")
    if (submitForm(!completed)) {
        log("completing task")
    } else {
        e.preventDefault()
    }
})

// show/hide task input (and other keybinds)

document.addEventListener("keydown", (e) => {
   // log the current key

})


// on "form-init" set form fields to values provided
ipcRenderer.on("form-init", (e, data) => {

    if (data == null || data == undefined) {
        return
    }

    log("\"form-init\" was received")
    taskname.value = data.heading
    taskfor.value = data.whoFor
    taskdate.value = data.dueDate
    taskdesc.value = data.description
    ttltask.innerHTML = "Editing Task: " + data.heading
    ttlwind.innerHTML = "Editing Task: " + data.heading

    oldHeading = data.heading
    cnltask.style.display = "inline-block"
    deltask.style.display = "inline-block"
    cmptask.style.display = "inline-block"
    deltask.style.color = "#F07178"

    if (data.completed) {
        cmptask.value = "completed"
        cmptask.style.color = "#98C379"
        completed = true
    } else {
        cmptask.value = "incomplete"
        cmptask.style.color = "#F07178"
        completed = false
    }
    edit = true
})

// ipc test function (pingpong)

ipcRenderer.on("test", (e, data) => {
    log("test")
    console.log(data)
});
