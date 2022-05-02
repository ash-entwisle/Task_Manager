const os = require("os-utils")
//const getSplash = require('./lib/splasher/splasher')
const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const url = require('url')
const path = require('path');
const { head } = require("request");

const DataStore = require('./lib/storer/storer').DataStore;
const store = new DataStore();

const renderer = require('./lib/renderer/renderer')
const timer = require('./lib/timer/timer')
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
    main.webContents.send("init", store.preferences);
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
  if (store.preferences.backup) {
    store.exportStore(`./src/data/backup/${timer.timestamp()}.json`);
  }
})


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// system functions


ipcMain.on("app-ready", (e) => {
  log("app up", locale)
  e.webContents.send("up");
  e.webContents.send("init", store.preferences);
  e.webContents.send("notify")
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
    store.updateTask(data);
  }
  refreshTasks()
});

// Data Edit (CRUD)
ipcMain.on("task-edit", (e, data, heading) => {
  log("task edit", locale)
  // if heading is in store, delete task with heading
  if (store.taskExists(heading)) {
    store.deleteTask(heading);
  }
  // add data to store
  store.addTask(data);
  refreshTasks()
});

// Data Delete (CRUD) (assume confirmation)
ipcMain.on("task-delete", (e, heading) => {
  log("task delete", locale)
  // delete task from store
  store.deleteTask(heading);
  refreshTasks()
});

// Data Complete (CRUD) (assume confirmation)
ipcMain.on("task-complete", (e, heading) => {
  log("task complete", locale)
  // complete task from store
  store.completeTask(heading);
  refreshTasks()
});


// loop through all tasks in store and send to renderer one by one
ipcMain.on("task-get-all", (e) => {
  log("get-tasks", locale)
  let data = store.getTasks();
  for (let i = 0; i < data.length; i++) {

    e.sender.send("task-render", store.isOverdue(data[i]), store.preferences) 
  }
})

// get task data by heading
ipcMain.on("task-fetch", (e, heading) => {
  log(`getting task: ${heading}`, locale)
  let task = store.getTask(heading)
  e.sender.send("task-fetch-r", task)
})

// check if task exists
ipcMain.on("task-check", (e, heading) => {
  log(`checking task: ${heading}`, locale)
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
})

ipcMain.on("form-open", (e, heading) => {
  log(`opening form...`, locale)

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
  
  // if undefined, send "error" to main
  if (form == undefined) {
    log("heading is undefined")
    e.sender.send("error", "You cant open more than one form at a time")
    return
  }

  // if task exists, send data to form
  form.on("ready-to-show", () => {
    if (heading) {
    form.webContents.send("form-init", data)
    }
  })
  
})

ipcMain.on("export-open", (e) => {
  log("export-open", locale)
  // open save dialog
  let path = dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
    title: "Export",
    defaultPath: "export.json",
    filters: [
      { name: "JSON", extensions: ["json"] }
    ]
  }).then(result => {
    if (result) {
      // export store to file
      if (result.canceled) {
        log("export canceled", locale)
      } else {
        log("export successful", locale)
        store.exportStore(result.filePath)
      }
    }
  })
})

ipcMain.on("import-open", (e) => {
  log("import-open", locale)
  // open open dialog
  let path = dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
    title: "Import",
    defaultPath: "",
    filters: [
      { name: "JSON", extensions: ["json"] }
    ]
  }).then(result => {if (result) {
    if (result.canceled) {
      log("import canceled", locale)
    } else {
      log("import successful", locale)
      store.importStore(result.filePaths[0])
    }}
    refreshTasks()
  })
})

ipcMain.on("pref-open", (e) => {
  log("pref-open", locale)
  // open preferences
  let pref = renderer.createPref()
  pref.on("ready-to-show", () => {
    pref.webContents.send("pref-init", store.preferences)
  })
})

ipcMain.on("pref-save", (e, data) => {
  log("pref-save", locale)
  // save preferences
  store.updatePreferences(data)
  refreshTasks()
})

ipcMain.on("notify", (e) => {
  log("notify", locale)
  // get incomplete tasks
  if (store.preferences.notify.enabled) {
    let tasks = store.getTasks()
    let data = {name: store.preferences.name, incomplete: 0, overdue: 0}
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].overdue) {data.overdue++}
      if (!tasks[i].completed) {data.incomplete++}
    }
    // send data to renderer
    e.sender.send("notify-r", data, store.preferences)
  }
})


ipcMain.on("log", (e, data, locale) => {
  log(data, locale)
})




