'use strict'

var path = require('path')
// var http = require('http')
var app = require('app')
var Menu = require('menu')
var Tray = require('tray')
var BrowserWindow = require('browser-window')
var crashReporter = require('crash-reporter')

// Report crashes to our server.
crashReporter.start()

if (!process.env.ipfs_endpoint) {
  process.env.ipfs_endpoint = 'http://localhost:5001'
}
process.env.NODE_PATH = path.join(__dirname, '/../node_modules');
console.log('NODE_PATH', process.env.NODE_PATH);
process.chdir(path.join(__dirname, '..'));

console.log('process.versions =', process.versions)

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null

var appIcon = null;

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform != 'darwin') {
    app.quit()
  }
})

// This method will be called when atom-shell has done everything
// initialization and ready for creating browser windows.
app.on('ready', function () {
  // Create the browser window.
  var atomScreen = require('screen')
  var size = atomScreen.getPrimaryDisplay().workAreaSize
  mainWindow = new BrowserWindow({
    width: size.width,
    height: size.height,
    'web-preferences': {
      'web-security': false,
    }
  })

  // and load the index.html of the app.
  // var url = path.normalize('file://' + __dirname + '/index.html')
  var url = ('file://' + __dirname + '/index.html')
  console.log('url', url)
  mainWindow.loadUrl(url)

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  appIcon = new Tray('static/music-19.png');
  var contextMenu = Menu.buildFromTemplate([
    {
      label: 'Quit',
      click: function () { app.quit() },
    },
  ]);
  appIcon.setToolTip('AllTheMusic');
  appIcon.setContextMenu(contextMenu);

  if (process.env.NODE_ENV === 'development') {
    mainWindow.openDevTools()
  }

})
