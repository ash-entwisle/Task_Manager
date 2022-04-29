const os = require("os-utils")
//const getSplash = require('./lib/splasher/splasher')
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const url = require('url')
const path = require('path');
const { head } = require("request");

const DataStore = require('./lib/storer/storer').DataStore;
const store = new DataStore();

const renderer = require('./lib/renderer/renderer')
const log = require('./lib/logger/logger').log;
let locale = "main";



if (require('electron-squirrel-startup')) { 
  app.quit();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  let splash = renderer.createSplash();
  let main = renderer.createMain();

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
    renderer.createMain();
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
  e.webContents.send("up");
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
  app.quit()
  //win.close()
  //app.quit()
});

ipcMain.on("win-close", () => {
  win = BrowserWindow.getFocusedWindow()
  win.close()
})



// main functions


function refreshTasks() {
  log("refreshing tasks", locale)
  for (let i = 0; i < BrowserWindow.getAllWindows().length; i++) {
    BrowserWindow.getAllWindows()[i].webContents.reload();
  }
}


//  =====   Data CRUD   =====

// Data Create (CRUD)
ipcMain.on("task-add", (e, data) => {
  log("task add", locale)
  // checks if task is not in store
  if (!store.taskExists(data.heading)) {
    // add task to store
    store.addTask(data);
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
  refreshTasks()
});

// Data Edit (CRUD)
ipcMain.on("task-edit", (e, data, heading) => {
  log("task edit", locale)
  if (store.taskExists(heading)) {
    store.updateTask(data, heading)
  } else {
    store.addTask(data);
  }
  refreshTasks()
});

// Data Delete (CRUD) (assume confirmation)
ipcMain.on("task-delete", (e, data) => {
  log("task delete", locale)
  // delete task from store
  if (store.taskExists(data.heading)) {
    store.deleteTask(data.heading);
  }
  refreshTasks()
});


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
  e.sender.send("task-fetch-r", task)
})

// check if task exists
ipcMain.on("task-check", (e, heading) => {
  if (store.taskExists(heading)) {
    log("task exists", locale)
    e.sender.send("task-check-r", true)
  } else {
    log("task does not exist", locale)
    e.sender.send("task-check-r", false)
  }
})

ipcMain.on("form-close", (e) => {
  log("form closed", locale)
  console.log(BrowserWindow.getAllWindows()[0])
})

ipcMain.on("form-open", (e, heading) => {
  log(`opening form...`, locale)

  // if 2 or more windows are open, send "err-form-open" to renderer
  if (BrowserWindow.getAllWindows().length > 1) {
    e.sender.send("err-form-open")
  } 

  // remove all dashes from heading
  if (heading) {
    heading = heading.replace(/-/g, " ")
    data = store.getTask(heading)
  }
  
  if (!store.taskExists(heading) && heading != undefined) {
    log("task does not exist")
    return
  }
  
  // create form
  let form = renderer.createForm()
  // get data

  // if task exists, send data to form
  form.on("ready-to-show", () => {
    if (heading) {
    form.webContents.send("form-init", data)
    }
  })
  form.on("closed", () => {
    form = null;
  });
})


ipcMain.on("log", (e, data, locale) => {
  log(data, locale)
})


