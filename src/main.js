const os = require("os-utils")
//const getSplash = require('./lib/splasher/splasher')
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const url = require('url')
const path = require('path');

const DataStore = require('./lib/storer/storer').DataStore;
const store = new DataStore();
const log = require('./lib/logger/logger').log;
let locale = "main";



if (require('electron-squirrel-startup')) { 
  app.quit();
}

// Function to create Splash Loading window
function createSplash() {
  let splash = new BrowserWindow({
    width: 400,
    height: 200,
    frame: false,
    resizable: false,
    openDevTools: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
    
  });
  splash.loadFile(path.join(__dirname, './view/preload/index.html'));
  splash.on('closed', () => {
    splash = null;
  });

  return splash;

}

// Function to create Main Window
function createMain(){
  log("window created", locale)  
  const mainWindow = new BrowserWindow({
    width: 750,
    height: 600,
    minWidth: 750,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    autoHideMenuBar: true,
    frame:false,
    show: false
  });
  mainWindow.loadFile(path.join(__dirname, './view/main/index.html'));
  mainWindow.webContents.openDevTools();

  return mainWindow;

};

// Function to create Task Form Window
function createTaskForm(data){
  log("task form created", locale)
  const taskForm = new BrowserWindow({
    width: 400,
    height: 200,
    minWidth: 400,
    minHeight: 200,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    autoHideMenuBar: true,
    frame:false,
    show: false
    });
  taskForm.loadFile(path.join(__dirname, './view/form/index.html'));
  taskForm.webContents.openDevTools();
  
  // if there is data, initialise the form with the data
  if (data) {
    taskForm.webContents.send('form-init', data);
  }
  
  return taskForm;

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  splash = createSplash();
  main = createMain();
  //show splash, when main is on ready-to-show, destroy splash
  
  main.on('ready-to-show', () => {
    splash.destroy();
    main.show();

  });

  log("app ready", locale)
});



// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  log("all windows closed", locale)
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

log("main script loaded", locale)
app.on('activate', () => {
  log("activate", locale)
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createMain();
  }
});

// logs when app quits

app.on("quit", () => {
  log("app quit", locale)
})


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// system functions


ipcMain.on("app-ready", (e) => {
  log("app up", locale)
  BrowserWindow.getFocusedWindow().webContents.send("up");
})

ipcMain.on('app-reduce', () => {
  win = BrowserWindow.getFocusedWindow()
  win.minimize()
});

ipcMain.on('app-minmax', () => {
  win = BrowserWindow.getFocusedWindow()
  if (win.isMaximized()) {
    win.unmaximize()
  } else {
    win.maximize()
  }
});

ipcMain.on('app-close', () => {
  win = BrowserWindow.getFocusedWindow()
  win.close()
});


// main functions


function renderAllTasks()


// Data CRUD

// Data Create (CRUD)
ipcMain.on("task-add", (e, data) => {
  log("task add", locale)
  // checks if task is not in store
  if (!store.taskExists(data.heading)) {
    // add task to store
    store.addTask(data);
    e.sender.send("task-refresh")
  } else {
    // if task is in store, ask for confirmation
    e.sender.send("task-confirm-edit", data.heading)
    ipcMain.on("task-confirm-edit-r", (e, bool) => {
      // if confirmed, update task
      if (bool) {
        store.updateTask(data);
      }
    });
  }
});

// Data Edit (CRUD)
ipcMain.on("task-edit", (e, data) => {
  log("task edit", locale)
  // delete task from store if it exists
  if (store.taskExists(data.heading)) {
    store.deleteTask(data.heading);
  } else {
    // if task doesnt exist, check if user wants to add it
    e.sender.send("task-confirm-add", data.heading)
    ipcMain.on("task-confirm-add-r", (e, bool) => {
      // if confirmed, add task
      if (bool) {
        store.addTask(data);
      }
    });
  }
  e.sender.send("task-refresh")
});

// Data Delete (CRUD) (assume confirmation)
ipcMain.on("task-delete", (e, data) => {
  log("task delete", locale)
  // delete task from store
  if (store.taskExists(data.heading)) {
    store.deleteTask(data.heading);
  }
  e.sender.send("task-refresh")
});


ipcMain.on('task-edit', (e, data) => {
  log("task-edit", locale)
  let jsondata = JSON.parse(data);
  if (!store.taskExists(jsondata.heading)) {
    log("task does not exist", locale)
    try {
      store.addTask(jsondata)
      e.sender.send("add-task", jsondata)
    } catch (error) {
      console.log(error)
    }
  } else {
    log("task exists", locale)
    try {
      store.updateTask(jsondata)
      e.sender.send("task-update", jsondata)
    } catch (error) {
      console.log(error)
    }
  }
  e.sender.send("task-refresh2")
  
})

// loop through all tasks in store and send to renderer one by one
ipcMain.on("task-get-all", (e) => {
  log("get-tasks", locale)
  for (let i = 0; i < store.tasks.length; i++) {
    e.sender.send("task-render", store.tasks[i])
  }
})

// get task data by heading
ipcMain.on("task-fetch", (e, heading) => {
  log(`getting task: ${heading}`, locale)
  let task = store.getTask(heading)
  //console.log(task)
  e.sender.send("task-fetch-response", task)
})

// check if task exists
ipcMain.on("task-check", (e, data) => {
  let jsondata = {heading: data};
  try {
    jsondata = JSON.parse(data);
  } catch (error) {}
  if (store.taskExists(jsondata.heading)) {
    log("task exists", locale)
    e.sender.send("task-check-response", true)
  } else {
    log("task does not exist", locale)
    e.sender.send("task-check-response", false)
  }
})


ipcMain.on("log", (e, data, locale) => {
  log(data, locale)
})
