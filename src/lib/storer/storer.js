const Store = require('electron-store');

const jsoner = require('./jsoner');
const schema = require('./schemer').schema;
const log = require('../logger/logger').log;
locale = "storer";



class DataStore extends Store {
    constructor() {
        super(schema())
        //this.dbm = new dbm();
        this.tasks = this.get('tasks') || []
        this.preferences = this.get('preferences') || {}
    }

    // get preferences
    getPreferences() {
        return this.preferences;
    }

    // need to add rest of pref stuff in


    // save tasks
    saveTasks() {
        log("saving tasks", locale)
        this.set('tasks', this.tasks)
    }

    // get all tasks
    getTasks() {
        log("getting all tasks", locale)
        return this.get('tasks') || []
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
        this.saveTasks()
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
        this.saveTasks()
    }

    // delete task
    deleteTask(heading) {
        log("deleting task", locale)
        const index = this.tasks.findIndex(t => t.heading === heading)
        this.tasks.splice(index, 1)   
        this.saveTasks()
    }

}


module.exports = {
    DataStore
}