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

const createSplash = () => {
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

const createMain = () => {
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
      e.sender.send("update-task", jsondata)
    } catch (error) {
      console.log(error)
    }
  }
  e.sender.send("update-task-list")
  
})

// loop through all tasks in store and send to renderer one by one
ipcMain.on("get-tasks", (e) => {
  log("get-tasks", locale)
  for (let i = 0; i < store.tasks.length; i++) {
    e.sender.send("add-task", store.tasks[i])
  }
})

// get task data by heading
ipcMain.on("fetch-task", (e, heading) => {
  log("got-task", locale)
  let task = store.getTask(heading)
  //console.log(task)
  e.sender.send("got-task", task)
})

// check if task exists
ipcMain.on("task-exists", (e, data) => {
  let jsondata = {heading: data};
  try {
    jsondata = JSON.parse(data);
  } catch (error) {}
  if (store.taskExists(jsondata.heading)) {
    log("task exists", locale)
    e.sender.send("task-exists-response", true)
  } else {
    log("task does not exist", locale)
    e.sender.send("task-exists-response", false)
  }
})


ipcMain.on("log", (e, data, locale) => {
  log(data, locale)
})
