const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const DataStore = require('./lib/storer/storer').DataStore;
const store = new DataStore();

const renderer = require('./lib/renderer/renderer')
const timer = require('./lib/timer/timer')
const log = require('./lib/logger/logger').log;
let locale = "main";


// misc boilerplate code
if (require('electron-squirrel-startup')) {app.quit();}

app.on('window-all-closed', () => {log("all windows closed", locale)
  if (process.platform !== 'darwin') {app.quit();}
});

app.on('activate', () => {log("app activated", locale)
  if (BrowserWindow.getAllWindows().length === 0) {renderer.createMain();}
});


// on ready, run these functions
app.on('ready', () => {
  // initialise main window and splash window
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


// if backup is enabled, create a backup of store every time the app is closed
app.on("quit", () => {log("app quit", locale)
  if (store.preferences.backup) {store.exportStore(`./src/data/backup/${timer.timestamp()}.json`);}
})

// when app is readuy, tell windows the app is up
ipcMain.on("app-ready", (e) => {log("app up", locale)
  e.webContents.send("up");                       // tell main window app is up
  e.webContents.send("init", store.preferences);  // gives main window preferences
  e.webContents.send("notify")                    // tells main window to show notification if enabled
})


// on app-close, close all windows
ipcMain.on('app-close', () => {app.quit()});
// on app-reduce, reduce all windows
ipcMain.on('app-reduce', () => {BrowserWindow.getFocusedWindow().minimize()});
// on window-close, close current window
ipcMain.on("win-close", () => {BrowserWindow.getFocusedWindow().close()});
// on minmax, toggle window state
ipcMain.on('app-minmax', () => {win = BrowserWindow.getFocusedWindow()
  if (win.isMaximized()) {win.unmaximize()} else {win.maximize()}
});



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




