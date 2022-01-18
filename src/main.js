const logger = require('./lib/logger/logger');
const { app, BrowserWindow } = require('electron');
const url = require('url')
const path = require('path');


if (require('electron-squirrel-startup')) { 
  app.quit();
}

const createWindow = () => {
  logger("window created")
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });
  mainWindow.loadFile(path.join(__dirname, './view/basewin/basewin.html'));
//  mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('quit', () => {
  logger('app-quit')
});
