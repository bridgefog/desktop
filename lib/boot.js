import path from 'path'
import fs from 'fs'
import { debuglog } from 'util'

import app from 'app'

// CAUTION: This file is not updated via the gossip/IPFS-based release distribution auto-update system. Changes here require cutting a new release package and convincing users to upgrade it. Use the bootLoaderVersion below to help control rollout if needed.
const bootLoaderVersion = '0.0.1'

var log = debuglog('boot')

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

process.env.FOG_BOOT_LOADER_VERSION = bootLoaderVersion
process.env.NODE_PATH = path.join(appPath, 'node_modules')
process.chdir(appPath)

log('process.env.NODE_PATH =', process.env.NODE_PATH)
log('process.cwd', process.cwd())

require(path.resolve(appPath, 'lib/main-process'))
