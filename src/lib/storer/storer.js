const Store = require('electron-store');
const store = new Store();

const schema = {
    tasks: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                heading: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 255,
                },
                for: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 255
                },
                description: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 255
                },
                dueDate: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 255
                },
                setDate: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 255
                },
                completed: {
                    type: 'boolean'
                }
            },
            required: ['heading', 'for', 'description', 'dueDate', 'setDate', 'completed']
        }
    }
};

const jsoner = require('./jsoner');
//const dbm = require('./sqler').dbm;
const log = require('../logger/logger').log;
locale = "storer";



class DataStore extends Store {
    constructor() {
        super(schema)
        //this.dbm = new dbm();
        this.tasks = this.get('tasks') || []
    }

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
    getTask(task) {
        log("getting task by title", locale)
        return this.get('tasks').find(task => task.heading === title)
    }

    // add task
    addTask(task) {
        log("adding task", locale)
        this.tasks.push(task)
        this.saveTasks()
    }

    // update task
    updateTask(task) {
        log("updating task", locale)
        const index = this.tasks.findIndex(t => t.heading === task.heading)
        this.tasks.splice(index, 1, task)
        this.saveTasks()
    }

    // delete task
    deleteTask(task) {
        log("deleting task", locale)
        this.tasks = this.tasks.filter(t => t.heading !== task.heading)
        this.saveTasks()
    }

}


module.exports = {
    DataStore
}