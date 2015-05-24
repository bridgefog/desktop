'use strict'

var app = require('app')
var Menu = require('menu')
var Tray = require('tray')
var BrowserWindow = require('browser-window')
var crashReporter = require('crash-reporter')
var ipfsProxy = require('./renderer/dev-support/ipfs-proxy')

// Report crashes to our server.
crashReporter.start()

console.log('process.versions =', process.versions)

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null

var server = new Server({
  ipfs: {
    host: 'localhost',
    gatewayPort: 8080,
    apiPort: 5001,
  },
})

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
  mainWindow = new BrowserWindow({ width: 800, height: 600 })

  // and load the index.html of the app.
  mainWindow.loadUrl('http://localhost:' + server.config.port + '/index.html')

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  appIcon = new Tray('music-19.png');
  var contextMenu = Menu.buildFromTemplate([
    {
      label: 'Quit',
      click: function () { app.quit() },
    },
  ]);
  appIcon.setToolTip('AllTheMusic');
  appIcon.setContextMenu(contextMenu);
})
