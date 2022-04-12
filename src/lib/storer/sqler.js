

const sqlite3 = require('sqlite3').verbose();

const timestamp = require('../timer/timer').timestamp;
const log = require('../logger/logger').log;
let locale = "DB"
// import sqlite3

const sqlNewTaskTable = `CREATE TABLE IF NOT EXISTS "Tasks" (
	"Heading"	    TEXT UNIQUE NOT NULL,
	"For"	        TEXT NOT NULL,
	"Description"	TEXT NOT NULL,
	"DueDate"	    INTEGER NOT NULL,
	"SetDate"	    INTEGER NOT NULL,
	"Completed"	    INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY("TaskID","Heading")
    );`








class dbm {
    constructor() {
        // connect to db
        this.db = new sqlite3.Database('./src/data/db/system.db', sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                log("error in opening database", locale)
            } else {
                log("database opened", locale)
            }
        });
        // create task table
        this.createTable();
    }
    // function to create table
    createTable() {
    this.db.serialize(() => {
        this.db.run(sqlNewTaskTable, (err) => {
            if (err) {
                console.log(err);
                log("error in creating table", locale)

            } else {
                log("table created", locale)
            }
        });
    })};

    // add task
    addTask(task) {
        this.db.serialize(() => {
            this.db.run(`INSERT INTO Tasks (Heading, For, Description, DueDate, SetDate, Completed) 
            VALUES (?, ?, ?, ?, ?, ?)`, [ 
                task.Heading, 
                task.For, 
                task.Description, 
                task.DueDate, 
                task.SetDate, 
                task.Completed
            ], (err) => {
                if (err) {
                    log("error in adding task", locale)
                } else {
                    log("task added", locale)
                }
            });
        })};

    // get task by taskname
    getTask(taskname) {
        this.db.serialize(() => {
            this.db.get(`SELECT * FROM Tasks WHERE Heading = ?`, [taskname], (err, row) => {
                if (err) {
                    log("error in getting task", locale)
                } else {
                    log("task retrieved", locale)
                    return row;
                }
            });
        })}

    // get all tasks
    getAllTasks() {
        let tasks = [];
        this.db.serialize(() => {
            this.db.each(`SELECT * FROM Tasks`, (err, row) => {
                if (err) {
                    log("error in getting all tasks", locale)
                } else {
                    tasks.push(row);
                }
            });
        })};
    
    // delete task
    deleteTask(task) {
        this.db.serialize(() => {
            this.db.run(`DELETE FROM Tasks WHERE AND Heading = ?`, [
                task.Heading
            ], (err) => {
                if (err) {
                    log("error in deleting task", locale)
                } else {
                    log("task deleted", locale)
                }
            })
        })};

    // close db
    close() {
        this.db.close((err) => {
            if (err) {
                log("error in closing database", locale)
            } else {
                log("database closed", locale)
            }
        })};

    


    
}

module.exports = {
    dbm
}




















/*
const sqlNewTaskTable = `CREATE TABLE "tasks" (
	"TaskID"	    INTEGER NOT NULL DEFAULT 0 UNIQUE,
	"Heading"	    TEXT NOT NULL,
	"For"	        TEXT NOT NULL,
	"Description"	TEXT NOT NULL,
	"DueDate"	    INTEGER NOT NULL,
	"SetDate"	    INTEGER NOT NULL,
	"Completed"	    INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY("TaskID","Heading")
    );`


const db = new sql.Database('.../data/db/system.db', (err) => {
    if (err) {
    logger(err, locale)
    }
    logger("connection made", locale)
});
*/
