import app from 'app'
import Menu from 'menu'
import BrowserWindow from 'browser-window'

import { restartApp } from './utils'
import { showInfoWindow } from './windows'

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
        label: 'Hide Electron',
        accelerator: 'Command+H',
        selector: 'hide:',
      },
      {
        type: 'separator',
      },
      {
        label: 'Restart',
        accelerator: 'Alt+Command+R',
        click: () => {
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
  {
    label: 'Edit',
    submenu: [
      // {
      //   label: 'Undo',
      //   accelerator: 'Command+Z',
      //   selector: 'undo:'
      // },
      // {
      //   label: 'Redo',
      //   accelerator: 'Shift+Command+Z',
      //   selector: 'redo:'
      // },
      // {
      //   type: 'separator'
      // },
      {
        label: 'Cut',
        accelerator: 'Command+X',
        selector: 'cut:',
      },
      {
        label: 'Copy',
        accelerator: 'Command+C',
        selector: 'copy:',
      },
      {
        label: 'Paste',
        accelerator: 'Command+V',
        selector: 'paste:',
      },
      {
        label: 'Select All',
        accelerator: 'Command+A',
        selector: 'selectAll:',
      },
    ],
  },
  {
    label: 'View',
    submenu: [
    ],
  },
  {
    label: 'Window',
    submenu: [
      {
        label: 'Information Window',
        accelerator: 'Shift+Alt+Command+I',
        click: showInfoWindow,
      },
      {
        type: 'separator'
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
        label: 'Reload',
        accelerator: 'Command+R',
        click: () => {
          var focusedWindow = BrowserWindow.getFocusedWindow()
          if (focusedWindow) { focusedWindow.reload() }
        },
      },
      {
        type: 'separator'
      },
      {
        label: 'Minimize',
        accelerator: 'Command+M',
        selector: 'performMiniaturize:',
      },
      {
        label: 'Close',
        accelerator: 'Command+W',
        selector: 'performClose:',
      },
      {
        type: 'separator'
      },
      {
        label: 'Bring All to Front',
        selector: 'arrangeInFront:',
      },
    ],
  },
  {
    label: 'Help',
    submenu: [],
  },
])

export default applicationMenu
