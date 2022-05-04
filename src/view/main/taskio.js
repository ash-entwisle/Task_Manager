const { ipcRenderer } = require("electron")                                 // import ipcRenderer
const locale = "win-main-taskio";                                           // set locale


// ===== Misc Functions =====

function log(data) {ipcRenderer.send("log", data, locale);}                 // log to main process

function remSpaces(str) {return str.replace(/\s/g, "-")}                    // remove spaces from string

function refreshTasks() {                                                   // refresh tasks
    log("refreshing tasks")
    let taskList = document.getElementById("cntr-tasklist");                // get task list
    taskList.innerHTML = "";                                                // clear task list
    ipcRenderer.send("task-get-all")                                        // send get all tasks event
}

function formatHTML (data) {                                                // format html and return
    let idheading = remSpaces(data.heading);                                // get id heading
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


// ===== IPC Events =====

ipcRenderer.on("task-render", (e, data, preferences) => {                   // render tasks
    log(`add-task: ${data.heading}`)
    let taskList = document.getElementById("cntr-tasklist");                // get task list                       
    if (!data.overdue && !data.completed) {                                 // if not overdue or completed, add to list
        taskList.innerHTML += `<a class="task-padding" id="${remSpaces(data.heading)}">${formatHTML(data)}</a>`
    }
    if (data.overdue && preferences.showOverdue) {                          // if overdue and show overdue
        log(`overdue task: ${data.heading}`)                                // add to list and set color to red
        taskList.innerHTML += `<a class="task-padding" id="${remSpaces(data.heading)}">${formatHTML(data)}</a>`
        document.getElementById(remSpaces(data.heading)).children[0].children[0].style.borderColor = "#F07178";
    }
    if (data.completed && preferences.showCompleted) {                      // if completed and show completed
        log(`completed task: ${data.heading}`)                              // add to list and set color to green
        taskList.innerHTML += `<a class="task-padding" id="${remSpaces(data.heading)}">${formatHTML(data)}</a>`
        document.getElementById(remSpaces(data.heading)).children[0].children[0].style.borderColor = "#98C379";
    }
});

ipcRenderer.on("task-update", (e, data) => {                                // update task
    log(`editing task: ${data.heading}`)
    let task = document.getElementById(data.heading);                       // get task
    task.innerHTML = formatHTML(data);                                      // update task
    refreshTasks();                                                         // refresh tasks
});


ipcRenderer.on("task-refresh", (e, data) => {                               // refresh tasks
    log("update-task-list")
    refreshTasks()                                                          // refresh tasks
});


// ===== Initialization =====

function main() {                                                           // main function
    log("taskIO.js loaded")
    refreshTasks();                                                         // refresh tasks
}

main();                                                                     // run main function


