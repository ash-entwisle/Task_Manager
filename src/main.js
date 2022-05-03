const { app, BrowserWindow, ipcMain, dialog } = require('electron');             // import electron stuff
const DataStore = require('./lib/storer/storer').DataStore;                      // import store 
const store = new DataStore();                                                   // initialize store                      
const renderer = require('./lib/renderer/renderer')                              // import renderer
const timer = require('./lib/timer/timer')                                       // import timer                  
const log = require('./lib/logger/logger').log;                                  // import logger            
let locale = "main";                                                              // set locale



// ===== App Lifecycle Stuff =====

if (require('electron-squirrel-startup')) {app.quit();}                         // Handle Squirrel

app.on('window-all-closed', () => {log("all windows closed", locale)            // close app on all windows closed
  if (process.platform !== 'darwin') {app.quit();}
});

app.on('activate', () => {log("app activated", locale)                          // macOS only
  if (BrowserWindow.getAllWindows().length === 0) {renderer.createMain();}
});

app.on('ready', () => {                                                         // when app is ready
  let splash = renderer.createSplash();                                         // create splash window
  let main = renderer.createMain();                                             // create main window
  main.on('ready-to-show', () => {                                              // when main window is ready to show
    main.webContents.send("init", store.preferences);                           // intialize main window
    splash.destroy();                                                           // destroy splash window
    main.show();                                                                // show main window
  });
  log("app ready", locale)
});

app.on("quit", () => {log("app quit", locale)         // if backup is enabled, create a backup of store every time the app is closed
  if (store.preferences.backup) {store.exportStore(`./src/data/backup/${timer.timestamp()}.json`);}
})

// when app is readuy, tell windows the app is up
ipcMain.on("app-ready", (e) => {log("app up", locale)                           // when app is ready
  e.webContents.send("up");                                                     // tell main window app is up
  e.webContents.send("init", store.preferences);                                // gives main window preferences
  e.webContents.send("notify")                                                  // tells main window to show notification if enabled
})

ipcMain.on('app-close', () => {app.quit()});                                    // close app     
ipcMain.on('app-reduce', () => {BrowserWindow.getFocusedWindow().minimize()});  // minimize app
ipcMain.on("win-close", () => {BrowserWindow.getFocusedWindow().close()});      // close win
ipcMain.on('app-minmax', () => {win = BrowserWindow.getFocusedWindow()          // min/max window
  if (win.isMaximized()) {win.unmaximize()} else {win.maximize()}
});



// ===== Main Functions =====

function refreshTasks() { // refresh all windows
  log("refreshing tasks", locale)
  for (let i = 0; i < BrowserWindow.getAllWindows().length; i++) {
    BrowserWindow.getAllWindows()[i].webContents.reload();
  }
}



//  =====   Data CRUD   =====

ipcMain.on("task-add", (e, data) => {                   // Data Create (CRUD)
  log("task add", locale)
  if (!store.taskExists(data.heading)) {                // checks if task is not in store
    store.addTask(data);                                // if in, add task to store
  } else {store.updateTask(data);}                      // if not, update task in store
  refreshTasks()
});

ipcMain.on("task-edit", (e, data, heading) => {         // Data Update (CRUD)
  log("task edit", locale)
  if (store.taskExists(heading)) {                      // if heading is in store,
    store.deleteTask(heading);}                         // delete task with heading
  store.addTask(data);                                  // then add new task with new heading
  refreshTasks()                                        // then refresh all windows
});

ipcMain.on("task-delete", (e, heading) => {             // Data Delete (CRUD)
  log("task delete", locale)
  store.deleteTask(heading);                            // delete task with heading
  refreshTasks()                                        // then refresh all windows
});

ipcMain.on("task-complete", (e, heading) => {           // Data complete (CRUD)
  log("task complete", locale)
  store.completeTask(heading);                          // complete task with heading
  refreshTasks()                                        // then refresh all windows
});

ipcMain.on("task-get-all", (e) => {                     // send all tasks to renderer
  log("get-tasks", locale)
  let data = store.getTasks();                          // get all tasks from store
  for (let i = 0; i < data.length; i++) {               // loop and send
    e.sender.send("task-render", store.isOverdue(data[i]), store.preferences) 
  }
})

ipcMain.on("task-fetch", (e, heading) => {              // get task data by heading
  log(`getting task: ${heading}`, locale)
  let task = store.getTask(heading)                     // get task from store
  e.sender.send("task-fetch-r", task)                   // send task data to renderer
})

ipcMain.on("task-check", (e, heading) => {              // check if task exists
  log(`checking task: ${heading}`, locale)
  if (store.taskExists(heading)) {                      // if task exists,
    log("task exists", locale)
    e.sender.send("task-check-r", true)                 // send true to renderer
  } else {                                              // else,
    log("task does not exist", locale)
    e.sender.send("task-check-r", false)                // send false to renderer
  }
})

ipcMain.on("form-open", (e, heading) => {               // open form window
  log(`opening form...`, locale)
  if (heading) {                                        // if heading is passed,
    heading = heading.replace(/-/g, " ")                // replace hyphens with spaces
    data = store.getTask(heading)                       // get task data from store
  }
  if (!store.taskExists(heading) && heading != undefined) {                  
    log("task does not exist")                          // if data or headng is undefined
    return                                              // return               
  }
  let form = renderer.createForm()                      // create form window 
  if (form == undefined) {                              // if form akready exists/undefined,
    log("heading is undefined")                         // send error
    e.sender.send("error", "You cant open more than one form at a time")
    return                                              // return
  }
  form.on("ready-to-show", () => {                      // when form is ready to show,
    if (heading) {                                      // if heading is passed,
      form.webContents.send("form-init", data)          // send data to form
    }
  })
  
})

ipcMain.on("export-open", (e) => {                      // open export window
  log("export-open", locale)                            // allow user to select path
  let path = dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
    title: "Export", defaultPath: "export.json",        // misc options
    filters: [{ name: "JSON", extensions: ["json"] }]
  }).then(result => {                                   // then if path has data,
      if (result.canceled) {                            // if user canceled,
        log("export canceled", locale)                  // cancel export
      } else {                                          // else,
        log("export successful", locale)        
        e.sender.send("export-r")                       // tell renderer task is exported
        store.exportStore(result.filePath)              // export store to path
      }
    }
  )
})

ipcMain.on("import-open", (e) => {                      // open import window
  log("import-open", locale)                            // allow user to select path
  let path = dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
    title: "Import", defaultPath: "",                   // misc options
    filters: [{ name: "JSON", extensions: ["json"] }]
  }).then(result => {if (result) {                      // then if path has data,
    if (result.canceled) {                              // if user canceled,
      log("import canceled", locale)                    // cancel import
    } else {                                            // else,
      log("import successful", locale) 
      e.sender.send("import-r")                         // tell renderer task is imported
      store.importStore(result.filePaths[0])            // import store from path
    }}
    refreshTasks()                                      // then refresh all windows
  })
})

ipcMain.on("pref-open", (e) => {                        // on open preferences window
  log("pref-open", locale)
  let pref = renderer.createPref()                      // initialize preferences window
  if (pref == undefined) {                              // if preferences window already exists,
    log("preferences already open", locale)             // send error
    e.sender.send("error", "You cant open more than one preferences window at a time")
    return                                              // return
  }
  pref.on("ready-to-show", () => {                      // when ready, send preference data
    pref.webContents.send("pref-init", store.preferences)
  })
})

ipcMain.on("pref-save", (e, data) => {                  // on save preferences
  log("pref-save", locale)
  store.updatePreferences(data)                         // update preferences in store
  refreshTasks()                                        // then refresh all windows
})

ipcMain.on("notify", (e) => {                           // notify user of task completion
  log("notify", locale)
  if (store.preferences.notify.enabled) {               // if notify is enabled,
    let tasks = store.getTasks()                        // get all tasks from store
    let data = {name: store.preferences.name, incomplete: 0, overdue: 0}
    for (let i = 0; i < tasks.length; i++) {            // loop through tasks
      if (tasks[i].overdue) {data.overdue++}            // if overdue, increment overdue
      if (!tasks[i].completed) {data.incomplete++}      // if incomplete, increment incomplete
    }
    e.sender.send("notify-r", data, store.preferences)  // send data to renderer
  }
})

ipcMain.on("focus", (e) => {                            // on focus,
  log("focus", locale)      
  e.sender.focus()                                      // focus renderer
})


ipcMain.on("log", (e, data, locale) => {                // on log,
  log(data, locale)                                     // log data
})  

