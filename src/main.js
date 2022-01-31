const logger = require('./lib/logger/logger');
let locale = "main";
const getSplash = require('./lib/splasher/splasher')
const { app, BrowserWindow } = require('electron');
const url = require('url')
const path = require('path');



if (require('electron-squirrel-startup')) { 

  app.quit();
}

const createWindow = () => {
  logger("window created", locale)  
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {nodeIntegration: true,devTools: false,}
  });
  mainWindow.loadFile(path.join(__dirname, './view/basewin/basewin.html'));
//  mainWindow.webContents.openDevTools();
};

app.on('ready', () => {
  logger('ready', locale);
  createWindow()
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    logger('window-all-closed', locale)
    app.quit();
  }
});

app.on('activate', () => {
  logger("activate", locale);
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('quit', () => {
  logger("app-quit", locale)
});

