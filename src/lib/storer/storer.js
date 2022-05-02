const Store = require('electron-store');

const jsoner = require('./jsoner');
const schema = require('./schemer').schema;
const date = require('../timer/timer').getFormatDate;
const log = require('../logger/logger').log;
locale = "storer";



class DataStore extends Store {
    constructor() {
        super(schema())
        this.tasks = this.get('tasks') || []
        this.preferences = this.get('preferences') || {
            name: "", showCompleted: false, showOverdue: false, backup: true,
            notify:  {enabled: true, onStartup: true, interval: 60, from: "0800", to: "1700" }
        }

        this.save()
    }

    // set store to object if it fits the schema
    importStore(path) {
        log("importing store", locale)
        let obj = jsoner.importJSON(path)
        try {
            this.preferences = obj.preferences
            this.tasks = obj.tasks
        } catch (err) {
            log("override failed", locale)
        }
        this.save()
    }

    // export store to path as json with a file name
    exportStore(path) {
        log("exporting store", locale)
        jsoner.exportJSON(path, {preferences: this.preferences, tasks: this.tasks})
    }

    // save tasks
    save() {
        //log("saving tasks", locale)
        this.set('tasks', this.tasks)
        this.set('preferences', this.preferences)
    }

    // get all tasks
    getTasks() {
        log("getting all tasks", locale)
        // sort all tasks in ascending order by due date formatted as YYYY-MM-DD
        this.tasks = this.tasks.sort((a, b) => {
            return new Date(a.dueDate) - new Date(b.dueDate)
        })  || []
        return this.tasks
    }

    // get task index by title
    getTaskIndex(title) {
        log("getting task index by title", locale)
        return this.tasks.findIndex(task => task.heading === title)
    }

    // check if task exists
    taskExists(title) {
        log("checking if task exists", locale)
        return  this.tasks.find(t => t.heading === title)
    }

    // get task by title
    getTask(title) {
        log("getting task by title - " + title, locale)
        return this.get('tasks').find(task => task.heading === title)
    }

    // add task
    addTask(task) {
        log("adding task", locale)
        if (!this.taskExists(task.heading)) {
            this.tasks.push(task)
        } else {
            this.updateTask(task)
        }
        this.save()
    }

    // update task
    updateTask(task, heading) {
        log("updating task", locale)
        // update task from store if there is a task with the same heading
        if (this.taskExists(heading)) {
            let index = this.getTaskIndex(heading)
            this.tasks[index] = task
        } else {
            this.addTask(task)
        }
        this.save()
    }

    // delete task
    deleteTask(heading) {
        log("deleting task", locale)
        if (this.taskExists(heading)) {
            const index = this.tasks.findIndex(t => t.heading === heading)
            this.tasks.splice(index, 1)   
        }
        this.save()
    }

    // check if task is completed
    isCompleted(heading) {
        log("checking if task is completed", locale)
        return this.getTask(heading).completed
    }

    // complete task
    completeTask(heading) {
        log("completing task", locale)
        this.getTask(heading).completed = true
        this.save()
    }

    // check if task is overdue
    isOverdue(data) {
        log("checking if task is overdue", locale)
        let overdue = data.dueDate < date()
        data.overdue = overdue
        this.updateTask(data, data.heading)
        this.save()
        return data
    }

    updatePreferences(preferences) {
        this.preferences = preferences
        this.save()
    }

}


module.exports = {
    DataStore
}