import path from 'path'
import fs from 'fs'

import app from 'app'
import Menu from 'menu'
import Tray from 'tray'
import BrowserWindow from 'browser-window'
import crashReporter from 'crash-reporter'
import ipc from 'ipc'
import globalShortcut from 'global-shortcut'

import R from 'ramda'

import IPFSDaemonController from './ipfs-daemon'
import { appDataDir, determineWindowDimensions, restartApp } from './utils'
import bootInfo from './boot-info'

function abort(message, err) {
  var dialog = require('dialog')
  console.log('ABORT:', message, err.stack)
  dialog.showErrorBox('Fog has died prematurely', message)
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
var infoWindow
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
})

app.on('ready', function () {
  var windowOpts = {
    'accept-first-mouse': true,
    'web-preferences': {
      'web-security': false,
    },
    title: 'Fog',
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
  appIcon.setToolTip('Fog')
  appIcon.setContextMenu(contextMenu)

  var applicationMenu = Menu.buildFromTemplate([
    {
      label: 'Fog',
      submenu: [
        {
          label: 'About Fog',
          selector: 'orderFrontStandardAboutPanel:',
        },
        {
          type: 'separator',
        },
        {
          label: 'Information Window',
          accelerator: 'Shift+Alt+Command+I',
          click: () => {
            infoWindow = new BrowserWindow(windowOpts)
            infoWindow.on('closed', () => infoWindow = null)
            var url = ('file://' + __dirname + '/info-window.html')
            infoWindow.loadUrl(url)
            infoWindow.webContents.once('did-finish-load', () => {
              infoWindow.show()
            })
          },
        },
        {
          label: 'Toggle DevTools',
          accelerator: 'Alt+Command+I',
          click: () => {
            var focusedWindow = BrowserWindow.getFocusedWindow()
            if (focusedWindow) { focusedWindow.toggleDevTools() }
          },
        },
        {
          type: 'separator',
        },
        {
          label: 'Restart',
          accelerator: 'Alt+Command+R',
          click: () => {
            mainWindow.webContents.send('app-will-restart')
            restartApp(app)
          },
        },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          selector: 'terminate:',
        },
      ],
    },
  ])
  Menu.setApplicationMenu(applicationMenu)

  ipfsDaemon.waitForReadiness().then(() => {
    // and load the index.html of the app.
    var url = 'file://' + path.resolve(__dirname, '../index.html')
    console.log('URL for mainWindow =', url)
    mainWindow.loadUrl(url)

    mainWindow.webContents.once('did-finish-load', () => {
      mainWindow.show()
    })

    if (process.env.GULP || process.env.NODE_ENV === 'development') {
      mainWindow.openDevTools({ detach: true })
    }

    mainWindow.on('focus', () => mainWindow.show())
  })

  globalShortcut.register('MediaPlayPause', () => {
    mainWindow.webContents.send('toggle-play-pause')
  })
})

ipc.on('restart-app', (event, arg) => {
  event.sender.send('app-will-restart')
  restartApp(app)
})

ipc.on('new-release-available', (event, releasePath) => {
  bootInfo.put('latestReleasePath', releasePath, err => {
    if (err) {
      console.error('ERROR while saving release info', err.stack)
    }
    event.sender.send('restart-required')
  })
})
