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

const subtask = document.getElementById("inp-tasksubmit")
const cnltask = document.getElementById("inp-taskcancel")
const deltask = document.getElementById("inp-taskdelete")
const cmptask = document.getElementById("inp-taskcomplete")



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

function enableEdit() {
    // hide subtask, show svetask, show deltask, show cmptask
    cnltask.style.display = "inline-block"
    deltask.style.display = "inline-block"
    cmptask.style.display = "inline-block"
    edit = true
}

function closeForm() {
    log("\"closeForm\" was clicked")
    // confirm that the user wants to close the form
    if (confirm("Are you sure?")) {
        ipcRenderer.send("win-close")
        ipcRenderer.send("form-close")
    } else {
        return
    }
}

function getFormData(){
    return {
        heading: document.getElementById("inp-taskname").value,
        whoFor: document.getElementById("inp-taskfor").value,
        description: document.getElementById("inp-taskdesc").value,
        setDate: time.getFormatDate(),
        dueDate: document.getElementById("inp-taskdate").value,
        completed: false
    }
}

function submitForm() {
    log("\"submitForm\" was clicked")
    let data = getFormData()
    if (edit) {
        log("edit task")
        ipcRenderer.send("task-edit", data, oldHeading)
    } else {
        log("add task")
        ipcRenderer.send("task-add", data)
    }
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

closeapp.addEventListener("click", () => {
    closeForm()
})

subtask.addEventListener("click", () => {
    log("\"subtask\" was clicked")
    submitForm()
    closeForm()
})

cnltask.addEventListener("click", () => {
    closeForm()
})


// show/hide task input (and other keybinds)

document.addEventListener("keydown", (e) => {
   // log the current key

})


// on "form-init" set form fields to values provided
ipcRenderer.on("form-init", (e, data) => {
    log("\"form-init\" was received")
    console.log(document.getElementById("inp-taskname").value)
    taskname.value = data.heading
    taskfor.value = data.whoFor
    taskdate.value = data.dueDate
    taskdesc.value = data.description
    enableEdit()
})

console.log(edit)
// ipc test function (pingpong)

ipcRenderer.on("test", (e, data) => {
    log("test")
    console.log(data)
});
