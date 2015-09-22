import path from 'path'
import fs from 'fs'

import app from 'app'
import Menu from 'menu'
import crashReporter from 'crash-reporter'
import ipc from 'ipc'
import globalShortcut from 'global-shortcut'

import bootInfo from './boot-info'
import applicationMenu from './application-menu'
import setupTrayIcon from './tray-icon'
import {
  restartApp,
  setupIPFS
} from './utils'
import { default as appWindows, windowOptions } from './windows'

var ipfsDaemon = setupIPFS()
process.env.ipfs_endpoint = ipfsDaemon.endpoint

var readyToDie = false

app.on('will-finish-launching', () => {
  // Report crashes to our server.
  // TODO: Make this useful!!
  crashReporter.start()
})

app.on('window-all-closed', () => {
  app.quit()
})

// FIXME: This is not great:
app.on('will-quit', e => {
  if (!readyToDie) {
    e.preventDefault()
    console.log('Killing IPFS')
    ipfsDaemon.shutdown()
      .then(() => {
        readyToDie = true
        app.quit()
      })

    // make sure it actually dies if something up there goes wonky
    // FIXME: there must be a better way!
    setTimeout(() => {
      readyToDie = true
      app.quit()
    }, 3000)
  }
})

app.on('ready', () => {
  var mainWindow = appWindows.showOrCreate('main', windowOptions())
  ipfsDaemon.waitForReadiness().then(() => {
    mainWindow.showUrl('./static/index.html')
    if (process.env.GULP || process.env.NODE_ENV === 'development') {
      mainWindow.openDevTools({ detach: true })
    }
  })

  Menu.setApplicationMenu(applicationMenu)
  setupTrayIcon()

  globalShortcut.register('MediaPlayPause', () => {
    mainWindow.webContents.send('toggle-play-pause')
  })
})

ipc.on('restart-app', (event, arg) => {
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
