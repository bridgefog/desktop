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
import window from 'electron-window'

import IPFSDaemonController from './ipfs-daemon'
import bootInfo from './boot-info'
import {
  appDataDir,
  determineWindowDimensions,
  restartApp
} from './utils'

var commonWindowOpts = {
  'accept-first-mouse': true,
  'web-preferences': {
    'web-security': false,
  },
  title: 'Fog',
  icon: 'resources/music-512.png',
}

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

function showInfoWindow() {
  if (window.windows.infoWindow) {
    window.windows.infoWindow.show()
    return
  }
  var windowOpts = R.merge(commonWindowOpts, determineWindowDimensions())
  var infoWindow = window.createWindow(windowOpts)
  infoWindow.showUrl('./static/info-window.html')
}

console.log('process.versions =', process.versions)

var ipfsDaemon = setupIPFS()
process.env.ipfs_endpoint = ipfsDaemon.endpoint

app.on('will-finish-launching', () => {
  // Report crashes to our server.
  // TODO: Make this useful!!
  crashReporter.start()

})
app.on('window-all-closed', () => {
  app.quit()
})

app.on('before-quit', () => {
  console.log('Killing IPFS')
  ipfsDaemon.shutdown()
})

app.on('ready', () => {
  var windowOpts = R.merge(commonWindowOpts, determineWindowDimensions())

  var mainWindow = window.createWindow(windowOpts)

  ipfsDaemon.waitForReadiness().then(() => {
    mainWindow.showUrl('./static/index.html')
    if (process.env.GULP || process.env.NODE_ENV === 'development') {
      mainWindow.openDevTools({ detach: true })
    }
  })

  var appIcon = new Tray('resources/music-19.png')
  var trayIconMenu = Menu.buildFromTemplate([
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
  appIcon.setContextMenu(trayIconMenu)

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
          click: showInfoWindow,
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
