const submitForm = document.getElementById("inp-tasksubmit")
const taskinp = document.getElementById("cntr-taskinp")

const { ipcRenderer } = require("electron")
const fs = require("fs")
const { format } = require("path")

//const DataStore = require("../../lib/storer/storer").DataStore;
//const store = new DataStore();
const getSplash = require("../../lib/splasher/splasher.js").getSplash;
const locale = "win-main-taskio";
const time = require("../../lib/timer/timer");




// system funcitons

function log(data) {
    ipcRenderer.send("log", data, locale);
}

function remSpaces(str) {
    // replace " " with "-"
    return str.replace(/\s/g, "-")
}

function conf() {
    return confirm("Are you sure?")
}


function notify() {
    log("notify")
    const notify = new Notification("Task Added", {
        body: "Task added to list"
    })
    notify.onclick = () => {
        log("notify clicked")
    }
}



function refreshTasks() {
    log("refreshing tasks")
    let taskList = document.getElementById("cntr-tasklist");
    taskList.innerHTML = "";
    ipcRenderer.send("task-get-all")
}

function formatHTML (data) {
    let idheading = remSpaces(data.heading);
    return `
<div class="task-item" id=${idheading}>
    <div class="task-card" id=${idheading}>
        <div class="task-grid" id=${idheading}>
            <div class="task-id" id=${idheading}>
                <div class="task-heading" id=${idheading}>
                    <span id=${idheading}>${data.heading}</span>
                </div>
                <div class="task-whowhen" id=${idheading}>
                    <div id=${idheading}>For: ${data.whoFor}</div>
                    <div id=${idheading}>Due: ${data.dueDate}</div>
                </div>
            </div>
            <div class="task-description" id=${idheading}>
                <p id=${idheading}>${data.description}</p>
            </div>
            <div class="task-btns" id=${idheading}>
                <div class="edit-btn" id=${idheading}>
                    <span class="btn-edit-task" id=${idheading}>Edit</span>
                </div>
                <div class="delete-btn" id=${idheading}>
                    <span class="btn-delete-task" id=${idheading}>Delete</span>
                </div>
            </div>
        </div>
    </div>
</div>`

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
        return
        
    }
    // send data to server
    ipcRenderer.send("task-edit", JSON.stringify(data));
    taskinp.style.display = "none";
});



// appends a new tasj to the task list

ipcRenderer.on("task-render", (e, data, preferences) => {
    log(`add-task: ${data.heading}`)
    let taskList = document.getElementById("cntr-tasklist");
    // if the data is not overdue AND the task is not completed, add it to the list
    console.log(data.overdue, data.completed)
    if (!data.overdue && !data.completed) {
        taskList.innerHTML += `<a class="task-padding" id="${remSpaces(data.heading)}">${formatHTML(data)}</a>`
    }
    // if the data is overdue, check if preferences are set to show overdue tasks and set the border color to red
    if (data.overdue && preferences.showOverdue) {
        log(`overdue task: ${data.heading}`)
        taskList.innerHTML += `<a class="task-padding" id="${remSpaces(data.heading)}">${formatHTML(data)}</a>`
        document.getElementById(remSpaces(data.heading)).children[0].children[0].style.borderColor = "#F07178";
    }
    // if the data is completed, check if preferences are set to show completed tasks and set the border color to green
    if (data.completed && preferences.showCompleted) {
        log(`completed task: ${data.heading}`)
        taskList.innerHTML += `<a class="task-padding" id="${remSpaces(data.heading)}">${formatHTML(data)}</a>`
        document.getElementById(remSpaces(data.heading)).children[0].children[0].style.borderColor = "#98C379";
    }



    /*
    if (!data.overdue === preferences.showOverdue && !data.completed === preferences.showCompleted) { 
        log(`adding task: ${data.heading}`)
        // get div with a class of task-card
        console.log(data)
        if (data.completed) {
            taskCard.style.borderColor = "#2979ff";
        }
        if (data.overdue) {
            taskCard.style.borderColor = "#F07178";
        }

    }*/
    
});

// edits a task based on heading

ipcRenderer.on("task-update", (e, data) => {
    log(`editing task: ${data.heading}`)
    // find a task with the id of data.heading and replace it with the new task
    let task = document.getElementById(data.heading);
    task.innerHTML = formatHTML(data);
    refreshTasks();
});


ipcRenderer.on("task-refresh", (e, data) => {
    log("update-task-list")
    refreshTasks()
});



// initial functions
function main() {
    log("taskIO.js loaded")
    //notify()
    refreshTasks();
}

main();




/*
"heading": "some random task"
"for": "some random person"
"description": "complete NEA"
"dueDate": "yyyy/mm/dd"
"setDate": "yyyy/mm/dd"
"completed": False
*/

