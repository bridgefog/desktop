import BrowserWindow from 'browser-window'

import R from 'ramda'
import electronWindow from 'electron-window'

const defaultWindowOptions = {
  'accept-first-mouse': true,
  'web-preferences': {
    'web-security': false,
  },
  title: 'Fog',
  icon: 'resources/music-512.png',
}

export function windowOptions(additionalOpts) {
  return R.mergeAll([
    defaultWindowOptions,
    additionalOpts,
    determineWindowDimensions(additionalOpts),
  ])
}

function determineWindowDimensions({width, height}={}) {
  // n.b. loading the 'screen' module must happen after app.'ready', hence inline require here
  let electronScreen = require('screen')

  let display = electronScreen.getPrimaryDisplay()
  let dimensions = {
    width: Math.min(width || 900, display.workAreaSize.width),
    height: Math.min(height || 1200, display.workAreaSize.width),
  }
  dimensions.x = Math.floor((display.workAreaSize.width - dimensions.width) / 2)
  dimensions.y = Math.floor((display.workAreaSize.height - dimensions.height) / 2)
  return dimensions
}

class WindowCollection {
  constructor() {
    this._windowIDs = {}
  }

  byName(name) {
    let windowID = this._windowIDs[name]
    if (windowID) {
      return electronWindow.windows[windowID]
    }
  }

  showOrCreate(name, optionsForCreate) {
    let existingWindow = this.byName(name)
    if (existingWindow) {
      existingWindow.show()
      return existingWindow
    }

    let newWindow = electronWindow.createWindow(optionsForCreate)
    if (optionsForCreate.url) {
      newWindow.showUrl(optionsForCreate.url)
    }

    this._windowIDs[name] = newWindow.id

    return newWindow
  }
}

const windows = new WindowCollection()

export function showInfoWindow() {
  return windows.showOrCreate('info', windowOptions({
    width: 400,
    height: 600,
    url: './static/info-window.html',
  }))
}

export default windows
