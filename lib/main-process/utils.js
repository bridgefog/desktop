import path from 'path'
import proc from 'child_process'

import app from 'app'

import mkdirp from 'mkdirp'
import R from 'ramda'

export function determineWindowDimensions() {
  var electronScreen = require('screen')
  var display = electronScreen.getPrimaryDisplay()
  var dimensions = {
    width: Math.min(900, display.workAreaSize.width),
    height: Math.min(1200, display.workAreaSize.width),
  }
  dimensions.x = Math.floor((display.workAreaSize.width - dimensions.width) / 2)
  dimensions.y = Math.floor((display.workAreaSize.height - dimensions.height) / 2)
  return dimensions
}

export function appDataDir(component) {
  var dir = path.join(app.getPath('appData'), 'com.bridgefog.beam', component)
  mkdirp.sync(dir)
  return dir
}

export function spawnProcP(command, args, options) {
  var logName = [command].concat(args.slice(0, 1)).join(' ')
  console.log(logName, 'starting')
  return new Promise((resolve, reject) => {
    options = R.merge(options, { stdio: ['inherit', 'inherit', 'inherit'] })
    var c = proc.spawn(command, args, options)
      .on('error', reject)

    var wrapper = { process: c }

    wrapper.exitP = new Promise((resolve, reject) => {
      c.on('exit', (code, signal) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(logName + ': process crashed with code=' + code + ', signal=' + signal))
        }
      })
    })

    // node doesn't provide a "the process successfully spawned" event, so we
    // just have to wait a few ms to ensure it wont "error" with a ENOENT, etc.
    setTimeout(() => resolve(wrapper), 100)
  })

}

export function waitProcess(wrapper) {
  return wrapper.exitP
}
