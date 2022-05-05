const minmax = document.getElementById("btn-minmax")                // minimize/maximize button
const reduce = document.getElementById("btn-reduce")                // minimize/maximize button
const closeapp = document.getElementById("btn-closeapp")            // close app button

let taskname = document.getElementById("inp-taskname")              // task name input
let taskfor = document.getElementById("inp-taskfor")                // task for input
let taskdate = document.getElementById("inp-taskdate")              // task date input
let taskdesc = document.getElementById("inp-taskdesc")              // task description input
let oldHeading = document.getElementById("inp-taskname").value      // old heading

const subtask = document.getElementById("inp-tasksubmit")           // subtask input
const cnltask = document.getElementById("btn-taskcancel")           // cancel task button
const deltask = document.getElementById("btn-taskdelete")           // delete task button
const cmptask = document.getElementById("btn-taskcomplete")         // complete task button
const ttltask = document.getElementById("btn-tasktitle")            // task title button
const ttlwind = document.getElementById("title")                    // title window

const { ipcRenderer } = require("electron")                         // import ipcRenderer
const time = require("../../lib/timer/timer");                      // import timer

const locale = "win-form-script";                                   // initialize locale
let edit = false                                                    // initialize edit mode
let completed = false                                               // assume completed is false


// ===== Functions =====

function log(data) {ipcRenderer.send("log", data, locale)}          // log data to main

function closeForm() {                                              // close form
    log("\"closeForm\" was clicked")                            
    if (confirm("Are you sure?")) {                                 // confirm close
        ipcRenderer.send("win-close")                               // close window
        ipcRenderer.send("form-close")                              // close form
        return true                                                 // return true
    }
}

function getFormData(complete = false) {                            // get form data
    let data = {                                                    // let data: 
        heading: document.getElementById("inp-taskname").value,     // heading,
        whoFor: document.getElementById("inp-taskfor").value,       // whoFor,
        description: document.getElementById("inp-taskdesc").value, // description,
        setDate: time.getFormatDate(),                              // setDate,
        dueDate: document.getElementById("inp-taskdate").value,     // dueDate,
        completed: complete                                         // completed
    }                                                               // if heading or date is empty,
    if (data.heading === "" || data.heading === undefined || data.setDate === "" || data.setDate === undefined) {
        alert("Please enter a task name and set a due date")        // alert user
        return
    }                                                               // if heading is empty,
    if (data.heading == "" || data.heading == undefined || data.heading == null) {
        alert("Task name cannot be empty")                          // alert user
        return
    }
    if (data.dueDate < data.setDate) {                              // if due date is before set date,
        alert("Task due date cannot be in the past")                // alert user
        return
    }
    return data                                                     // return data
}

function submitForm(complete = false) {                             // submit form
    log("\"submitForm\" was clicked")   
    let data = getFormData(complete)                                // get form data
    if (data === undefined) {return}                                // return if data is undefined
    if (oldHeading === "") {oldHeading = data.heading}              // if old heading is empty, overwrite
    ipcRenderer.send("task-check", oldHeading)                      // check if old heading is the same as new heading
    ipcRenderer.on("task-check-r", (e, exists) => {                 // on response,
        if (exists || data.heading == oldHeading) {                 // if task exists or heading is the same as old heading,
            log("task exists")                                      // ask user if they want to overwrite
            if (confirm(`${data.heading} already exists. Overwrite?`)) {
                ipcRenderer.send("task-edit", data, oldHeading)     // if, send data to main
                ipcRenderer.send("form-close")                      // close form
                ipcRenderer.send("win-close")                       // close window
            } else {return}                                         // else, return
        } else {                                                    // if old heading is not the same as new heading,         
            log(`${oldHeading} does not exist`)
            if (confirm("Save Task?")) {                            // ask user if they want to save
                ipcRenderer.send("task-add", data)                  // if, send data to main
                ipcRenderer.send("form-close")                      // close form
                ipcRenderer.send("win-close")                       // close window
            } else {return}                                         // else, return 
        }})
    return data                                                     // return data
}

// ===== Onclick Events =====

closeapp.addEventListener("click", () => {                          // onclick close app
    log("\"closeapp\" was clicked")
    closeForm()                                                     // close form
})

reduce.addEventListener("click", () => {                            // onclick minimize
    log("window reduced")
    ipcRenderer.send("app-reduce")                                  // reduce window
})

minmax.addEventListener("click", () => {                            // onclick maximize     
    log("window minmaxed")
    ipcRenderer.send("app-minmax")                                  // min/maximize window
})

subtask.addEventListener("click", (e) => {                          // onclick submit task
    log("\"subtask\" was clicked")                              
    if (submitForm()) {log("adding task")}                          // if submit form returns true, task is added
    else {e.preventDefault()}                                       // else, prevent default
})

cnltask.addEventListener("click", () => {                           // onclick cancel task
    log("\"cnltask\" was clicked")      
    closeForm()                                                     // close form
})

deltask.addEventListener("click", () => {                           // onclick delete task
    log("\"deltask\" was clicked")
    if (edit === true) {                                            // if edit mode is true,
        if (confirm("Are you sure?")) {                             // ask user if they want to delete
            ipcRenderer.send("task-delete", oldHeading)             // if, send old heading to main
            ipcRenderer.send("form-close")                          // close form
            ipcRenderer.send("win-close")                           // close window
        }
    }
})

cmptask.addEventListener("click", (e) => {                          // onclick complete task
    log("\"cmptask\" was clicked")
    if (submitForm(!completed)) {log("completing task")             // if submit form returns true, task is completed
    } else {e.preventDefault()}                                     // else, prevent default
})

document.addEventListener("keydown", (e) => {                       // one-key keybinds
})


// ===== IPC Events =====

ipcRenderer.on("form-init", (e, data) => {                          // on form init,
    if (data == null || data == undefined) {return}                 // if data is undefined, return
    log("\"form-init\" was received")
    taskname.value = data.heading                                   // set taskname value
    taskfor.value = data.whoFor                                     // set taskfor value
    taskdate.value = data.dueDate                                   // set taskdate value
    taskdesc.value = data.description                               // set taskdesc value
    ttltask.innerHTML = "Editing Task: " + data.heading             // set ttltask value
    ttlwind.innerHTML = "Editing Task: " + data.heading             // set ttlwind value

    oldHeading = data.heading                                       // set old heading
    cnltask.style.display = "inline-block"                          // show cancel task button
    deltask.style.display = "inline-block"                          // show delete task button
    cmptask.style.display = "inline-block"                          // show complete task button
    deltask.style.color = "#F07178"                                 // set delete task button color

    if (data.completed) {                                           // if task is completed,
        cmptask.value = "completed"                                 // set complete button value
        cmptask.style.color = "#98C379"                             // set complete task color
        completed = true                                            // set completed to true
    } else {
        cmptask.value = "incomplete"                                // set complete button value
        cmptask.style.color = "#F07178"                             // set complete task color
        completed = false                                           // set completed to false
    }
    edit = true                                                     // set edit to true
})

ipcRenderer.on("test", (e, data) => {console.log(data)});           // on test, log data
