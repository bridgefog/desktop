import path from 'path'
import fs from 'fs'
import { debuglog } from 'util'

import app from 'app'

var log = debuglog('boot')

// log('home', app.getPath('home'))
// log('appData', app.getPath('appData'))
// log('userData', app.getPath('userData'))
// log('cache', app.getPath('cache'))
// log('userCache', app.getPath('userCache'))
// log('temp', app.getPath('temp'))
// log('userDesktop', app.getPath('userDesktop'))
// log('exe', app.getPath('exe'))
// log('module', app.getPath('module'))

var embeddedRelease = app.getAppPath()

var bootInfo
var bootInfoPath = path.join(app.getPath('userData'), 'boot-info.json')
log('Looking for boot info:', bootInfoPath)

try {
  bootInfo = require(bootInfoPath)
} catch (_) {
  bootInfo = {}
}

var latestReleasePath = bootInfo.$latestReleasePath

var appPath
if (latestReleasePath)  {
  log('Using release path from boot-info', latestReleasePath)
  appPath = path.resolve(app.getPath('userData'), latestReleasePath)
} else {
  log('Using release path from embed', embeddedRelease)
  appPath = embeddedRelease
}

process.env.NODE_PATH = path.join(appPath, 'node_modules')
process.chdir(appPath)

log('process.env.NODE_PATH =', process.env.NODE_PATH)
log('process.cwd', process.cwd())

require(path.resolve(appPath, 'dist/main_process'))
