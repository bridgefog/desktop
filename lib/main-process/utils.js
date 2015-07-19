import path from 'path'
import proc from 'child_process'

import app from 'app'
import BrowserWindow from 'browser-window'

import mkdirp from 'mkdirp'

import IPFSDaemonController from './ipfs-daemon'

export function appDataDir(component) {
  var dir = path.join(app.getPath('userData'), component)
  mkdirp.sync(dir)
  return dir
}

export function abortApp(message, err) {
  var dialog = require('dialog')
  console.log('ABORT:', message, err.stack)
  dialog.showErrorBox('Fog has died prematurely', message)
  app.quit()
}

export function restartApp(app) {
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('app-will-restart')
  })

  process.nextTick(() => {
    console.log('Restarting...')
    var opts = {
      stdio: ['ignore', 'ignore', 'ignore'],
      detached: true,
    }
    proc.spawn(process.execPath, process.argv.slice(1), opts)
    // TODO: handle spawn error here and tell user to re-start manually
    app.quit()
  })
}

export function setupIPFS() {
  var ipfs = new IPFSDaemonController({
    ipfsDir: appDataDir('ipfs'),
    shouldRestart: true,
  })

  ipfs.startChild()
    .catch((err) => {
      abortApp('Failed to start to IPFS!', err)
    })

  ipfs.waitForReadiness(30 * 1000)
    .then(() => console.log('IPFS is ready!'))
    .catch((err) => {
      abortApp('Failed to connect to IPFS!', err)
    })

  ipfs.waitProcess()
    .catch(err => {
      if (ipfs.shuttingDown) { return }
      abortApp('IPFS has died', err)
    })

  return ipfs
}
