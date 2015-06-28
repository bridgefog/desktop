'use strict'

var path = require('path')
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
process.chdir(path.join(__dirname, '..'));

var R = require('ramda')

console.log('process.versions =', process.versions)

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow
var appIcon
var ipfsChildProc

var appIcon = null;

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // if (process.platform != 'darwin') {
    app.quit()
  // }
})

function determineWindowDimensions() {
  var electronScreen = require('screen')
  var display = electronScreen.getPrimaryDisplay()
  var dimensions = {
    width: Math.min(1200, display.workAreaSize.width),
    height: Math.min(1200, display.workAreaSize.width),
  }
  dimensions.x = Math.floor((display.workAreaSize.width - dimensions.width) / 2)
  dimensions.y = Math.floor((display.workAreaSize.height - dimensions.height) / 2)
  return dimensions
}

app.on('ready', function () {
  var windowOpts = {
    'accept-first-mouse': true,
    'web-preferences': {
      'web-security': false,
    },
    title: 'BridgeFog',
    icon: 'dist/music-512.png',
  }

  windowOpts = R.merge(windowOpts, determineWindowDimensions())
  mainWindow = new BrowserWindow(windowOpts)

  // and load the index.html of the app.
  var url = ('file://' + __dirname + '/index.html')
  mainWindow.loadUrl(url)

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  appIcon = new Tray('dist/music-19.png');
  var contextMenu = Menu.buildFromTemplate([
    {
      label: 'Quit',
      click: function () { app.quit() },
    },
  ]);
  appIcon.setToolTip('BridgeFog');
  appIcon.setContextMenu(contextMenu);

  if (process.env.NODE_ENV === 'development') {
    mainWindow.openDevTools()
  }
})
