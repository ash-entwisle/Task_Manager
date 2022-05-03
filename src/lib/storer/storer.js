const Store = require('electron-store');                                    // import store
const jsoner = require('./jsoner');                                         // import jsoner
const schema = require('./schemer').schema;                                 // import schema
const date = require('../timer/timer').getFormatDate;                       // import date
const log = require('../logger/logger').log;                                // import log function
locale = "storer";                                                          // set the locale

class DataStore extends Store {                                             // extent Store to add functions
    constructor() {super(schema())                                          // call super constructor
        this.tasks = this.get('tasks') || []                                // set tasks to store tasks or empty array
        this.preferences = this.get('preferences') || {                     // set preferences to store preferences or default preferences
            name: "", showCompleted: false, showOverdue: false, backup: true,
            notify:  {enabled: true, onStartup: true, interval: 60, from: "0800", to: "1700" }
        }
        this.save()                                                         // save store
    }

    importStore(path) {                                                     // import store from path
        log("importing store", locale)
        let obj = jsoner.importJSON(path)                                   // get json object
        try {                                                               // try,
            this.preferences = obj.preferences                              // set preferences
            this.tasks = obj.tasks                                          // set tasks
        } catch (err) {                                                     // if err,
            log("override failed", locale)                                  // log override failed
        }
        this.save()                                                         // save store
    }

    exportStore(path) {                                                     // export store to path
        log("exporting store", locale)                                      // send data to jsoner to export
        jsoner.exportJSON(path, {preferences: this.preferences, tasks: this.tasks})
    }

    save() {                                                                // save store
        this.set('tasks', this.tasks)                                       // set tasks to store tasks
        this.set('preferences', this.preferences)                           // set preferences to store preferences
    }

    getTasks() {                                                            // get tasks
        log("getting all tasks", locale)
        this.tasks = this.tasks.sort((a, b) => {                            // sort tasks...
            return new Date(a.dueDate) - new Date(b.dueDate)                // by due date
        })  || []                                                           // or set tasks to empty array
        return this.tasks                                                   // return tasks
    }

    getTaskIndex(title) {                                                   // get task index
        log("getting task index by title", locale)      
        return this.tasks.findIndex(task => task.heading === title)         // return index of task with heading
    }

    taskExists(title) {                                                     // check if task exists
        log("checking if task exists", locale)
        return  this.tasks.find(t => t.heading === title)                   // return true if task exists
    }

    getTask(title) {                                                        // get task
        log("getting task by title - " + title, locale)
        return this.get('tasks').find(task => task.heading === title)       // return task with heading
    }

    addTask(task) {                                                         // add task
        log("adding task", locale)
        if (!this.taskExists(task.heading)) {this.tasks.push(task)}         // if task doesn't exist, add task
        else {this.updateTask(task)}                                        // else update task
        this.save()                                                         // save store
    }

    updateTask(task, heading) {                                             // update task 
        log("updating task", locale)
        if (this.taskExists(heading)) {                                     // if task exists
            let index = this.getTaskIndex(heading)                          // get index of task
            this.tasks[index] = task                                        // update task
        } else {this.addTask(task)}                                         // else add task
        this.save()                                                         // save store
    }

    deleteTask(heading) {                                                   // delete task
        log("deleting task", locale)
        if (this.taskExists(heading)) {                                     // if task exists
            const index = this.tasks.findIndex(t => t.heading === heading)  // get index of task
            this.tasks.splice(index, 1)                                     // remove task
        }
        this.save()                                                         // save store
    }

    isCompleted(heading) {                                                  // check if task is completed
        log("checking if task is completed", locale)
        return this.getTask(heading).completed                              // return true if task is completed
    }

    completeTask(heading) {                                                 // complete task
        log("completing task", locale)
        this.getTask(heading).completed = true                              // set task to completed
        this.save()                                                         // save store
    }

    isOverdue(data) {                                                       // check if task is overdue
        log("checking if task is overdue", locale)  
        let overdue = data.dueDate < date()                                 // check if due date is before today
        data.overdue = overdue                                              // set overdue to true if overdue
        this.updateTask(data, data.heading)                                 // update task
        this.save()                                                         // save store
        return data                                                         // return task
    }

    updatePreferences(preferences) {                                        // update preferences
        this.preferences = preferences                                      // set preferences to preferences
        this.save()                                                         // save store
    }
}


module.exports = { DataStore }                                              // export store