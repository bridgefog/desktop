import path from 'path'

import app from 'app'
import Menu from 'menu'
import Tray from 'tray'
import BrowserWindow from 'browser-window'
import crashReporter from 'crash-reporter'
import ipc from 'ipc'

// Fix NODE_PATH so we can `require()` things from node_modules
process.env.NODE_PATH = path.join(__dirname, '/../node_modules');
process.chdir(path.join(__dirname, '..'));

import R from 'ramda'

import IPFSDaemonController from './main-process/ipfs-daemon'
import { appDataDir, determineWindowDimensions, restartApp } from './main-process/utils'
import storage from './main-process/storage'

function abort(message, err) {
  var dialog = require('dialog')
  console.log('ABORT:', message, err.stack)
  dialog.showErrorBox('BridgeFog has died prematurely', message)
  app.quit()
}

function setupIPFS() {
  var ipfs = new IPFSDaemonController({
    ipfsDir: appDataDir('ipfs'),
    shouldRestart: true,
  })

  ipfs.startChild()
    .catch((err) => {
      abort('Failed to start to IPFS!', err)
    })

  ipfs.waitForReadiness(30 * 1000)
    .then(() => console.log('IPFS is ready!'))
    .catch((err) => {
      abort('Failed to connect to IPFS!', err)
    })

  ipfs.waitProcess()
    .catch(err => {
      if (ipfs.shuttingDown) { return }
      abort('IPFS has died', err)
    })

  return ipfs
}

console.log('process.versions =', process.versions)

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow
var appIcon

// Report crashes to our server.
// TODO: Make this useful!!
crashReporter.start()

var ipfsDaemon = setupIPFS()
process.env.ipfs_endpoint = ipfsDaemon.endpoint

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  app.quit()
})

app.on('before-quit', function () {
  console.log('Killing IPFS')
  ipfsDaemon.shutdown()
  storage.close()
})

app.on('ready', function () {
  var windowOpts = {
    'accept-first-mouse': true,
    'web-preferences': {
      'web-security': false,
    },
    title: 'BridgeFog',
    icon: 'dist/music-512.png',
    show: false,
  }

  windowOpts = R.merge(windowOpts, determineWindowDimensions())

  mainWindow = new BrowserWindow(windowOpts)
  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  appIcon = new Tray('dist/music-19.png')
  var contextMenu = Menu.buildFromTemplate([
    {
      label: 'Quit',
      click: () => { app.quit() },
    },
    {
      label: 'Restart',
      click: () => {
        mainWindow.webContents.send('app-will-restart')
        restartApp(app)
      },
    },
  ])
  appIcon.setToolTip('BridgeFog')
  appIcon.setContextMenu(contextMenu)

  ipfsDaemon.waitForReadiness().then(() => {
    // and load the index.html of the app.
    var url = ('file://' + __dirname + '/index.html')
    mainWindow.loadUrl(url)

    mainWindow.webContents.once('did-finish-load', () => {
      if (process.env.GULP || process.env.NODE_ENV === 'development') {
        mainWindow.openDevTools({ detach: true })
      }
      mainWindow.show()
    })

    mainWindow.on('focus', () => mainWindow.show())
  })
})

ipc.on('restart-app', (event, arg) => {
  event.sender.send('app-will-restart')
  restartApp(app)
})
