# **Welcome**

Hello and welcome to my repo, Here you will find the code and docs for my open-source task management applicaiton. The goal of this project is to make a simple and light weight task management application with the ability to export and import task files and be able to send desktop notifications. This project came about to help my easily distracted self and whoever wants to use it. All the code here is under []

In this document, you will find all the documentation for all of the code. It is still being edited 

# Setup

install packages in package.json and run using npm start


If error with packages, add below at line 51 in package.json
```
    "axios": "^0.26.1",
    "os-utils": "^0.0.14",
    "request": "^2.88.2",

```



# IPC Event Documentation


* `app-ready` - sent by renderer to main, tells main that front end is ready
* `up` - sent from main to renderer to tell the main window that its ready to send data
* `log` - sent from renderer to main, uses logger.js to log data
* `app-reduce` - minimises the focussed window
* `app-minmax` - toggles smaller and maximised view on focussed window
* `app-close` - closes current focussed window
* `task-add`  - adds a new task to db
* `task-edit` - deletes the edited task, creates a new task with the edited data
* `task-render-all` - renderer requests to get all task data *(loops through all, calls "task-render")*
* `task-fetch` - gets task data with a specified heading *(returns "task-fetch-r")*
* `task-check` - checks if a task with a spesific heading exists 
* `form-init` - initialises the form with the data of the task to be edited (if it exists)
 

# Processes

**Add Task:**
```
MAINWIN "win-form" >> MAINPRC (opens the form window)
MAINPRC (opens formwin)
FORMWIN "task-add" >> MAINPRC (appends a task to the db)
MAINPRC "task-refresh" >> MAINWIN (tells main window to clear tasklist and refresh tasks)
```

**Edit Task:**
```
MAINWIN (get heading of the task that needs editing)
MAINWIN "task-check" >> MAINPRC (asks main to check if task exists)
FORMWIN "task-check-r" >> MAINWIN (returns bool, if true...)
MAINWIN "win-form" >> MAINPRC (opens the form window)
MAINWIN (open form window)
MAINWIN "task-edit" >> MAINPRC (deletes old task, creates new task with edted data)
```

**Delete Task:**
```
MAINWIN "task-check" >> MAINPRC (asks main to check if task exists)

```