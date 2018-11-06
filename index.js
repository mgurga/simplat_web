const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({ width: 1600, height: 900 })

  // and load the index.html of the app.
  win.loadFile('index.html')
}

app.on('ready', createWindow)
