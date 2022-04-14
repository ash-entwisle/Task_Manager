const minmax = document.getElementById("btn-minmax")
const reduce = document.getElementById("btn-reduce")
const closeapp = document.getElementById("btn-closeapp")
const submitForm = document.getElementById("inp-tasksubmit")

const { ipcRenderer } = require("electron")
const fs = require("fs")
const { format } = require("path")

//const DataStore = require("../../lib/storer/storer").DataStore;
//const store = new DataStore();
const getSplash = require("../../lib/splasher/splasher.js").getSplash;
const log = require("../../lib/logger/logger").log;
const locale = "win-main-script";
const time = require("../../lib/timer/timer");

// system funcitons

function refreshTasks() {
    log("refreshing tasks", locale)
    let taskList = document.getElementById("cntr-tasklist");
    taskList.innerHTML = "";
    ipcRenderer.send("get-tasks")

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

// code to handle accordion functionality 

function accordion(e) {
    log("accordion", locale)
    let panel = e.target.nextElementSibling;
    if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
    } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
    }
}



// delete the corresponding task when the delete button is clicked




// submit form event

submitForm.addEventListener("click", (event) => {
    event.preventDefault();
    
    // get data from form
    let data = {
        heading: document.getElementById("inp-taskname").value,
        whoFor: document.getElementById("inp-taskfor").value,
        description: document.getElementById("inp-taskdesc").value,
        setDate: time.getFormatDate(),
        dueDate: document.getElementById("inp-taskdate").value,
        completed: false
    }
    
    // send heading to main to check if it exists
    ipcRenderer.send("task-exists", JSON.stringify(data))

    // on respose from main, if task exists, display a confirmation box to overwrite
    ipcRenderer.on("task-exists-response", (event, arg) => {
        if (arg === true) {
            // task exists, ask to overwrite
            let overwrite = confirm("Task already exists. Overwrite?")
            if (!overwrite) {
                // if not overwriting, exit
                return
            }
        }
    });

    // loop through datat to check for any blank fields
    for (let key in data) {
        if (data[key] === "") {
            alert("Please fill in all fields")
            return
        }
    }
    
    // check if due date is in the past
    if (new Date(data.dueDate) < new Date()) {
        alert("Due date cannot be in the past")
        
    }
    // send data to server
    ipcRenderer.send("task-edit", JSON.stringify(data));
});


// ipc test function (pingpong)

ipcRenderer.on("test", (e, data) => {
    log("test", locale)
    console.log(data)
});


// appends a new tasj to the task list

ipcRenderer.on("add-task", (e, data) => {
    log(`add-task: ${data.heading}`, locale)
    let taskList = document.getElementById("cntr-tasklist");
    // append task to taskList with the class of task-accordion and the id of data.heading
    taskList.innerHTML += `<a class="task-padding">
        <div class="task-item"><div class="task-card">
        <div class="task-grid">
            <div class="task-id">
                <div class="task-heading">
                    <span>${data.heading}</span>
                </div>
                <div class="task-whowhen">
                    <a>For: ${data.whoFor} on: ${data.dueDate}</a>
                </div>
            </div>
            <div class="task-description">
                <p>${data.description}</p>
            </div>
            <div class="task-btns">
                <div class="edit-btn">
                    <span class="btn-edit-task">Edit</span>
                </div>
                <div class="delete-btn">
                    <span class="btn-delete-task">Delete</span>
                </div>
            </div>
        </div>
    </div>

    </a>`
            
});

// edits a task based on heading

ipcRenderer.on("edit-task", (e, data) => {
    log(`editing task: ${data.heading}`, locale)
    // find a task with the id of data.heading and replace it with the new task
    let task = document.getElementById(data.heading);
    edit = `<a class="task-padding">
        <div class="task-item"><div class="task-card">
        <div class="task-grid">
            <div class="task-id">
                <div class="task-heading">
                    <span>${data.heading}</span>
                </div>
                <div class="task-whowhen">
                    <a>For: ${data.whoFor} on: ${data.dueDate}</a>
                </div>
            </div>
            <div class="task-description">
                <p>${data.description}</p>
            </div>
            <div class="task-btns">
                <div class="edit-btn">
                    <span class="btn-edit-task">Edit</span>
                </div>
                <div class="delete-btn">
                    <span class="btn-delete-task">Delete</span>
                </div>
            </div>
        </div></div>
    </div>

    </a>`
    task.innerHTML = edit;
    ipcRenderer.send("task-edit", edit)
});


ipcRenderer.on("update-task-list", (e, data) => {
    log("update-task-list", locale)
    refreshTasks()
});




// initial functions

refreshTasks();



/*
"heading": "some random task"
"for": "some random person"
"description": "complete NEA"
"dueDate": "yyyy/mm/dd"
"setDate": "yyyy/mm/dd"
"completed": False
*/

