import Tray from 'tray'
import Menu from 'menu'

import { restartApp } from './utils'

export default function makeTray() {
  var appIcon = new Tray('resources/music-19.png')

  appIcon.setToolTip('Fog')
  appIcon.setContextMenu(Menu.buildFromTemplate([
    {
      label: 'Quit',
      click: () => { app.quit() },
    },
      {
        label: 'Restart',
        click: () => {
          restartApp(app)
        },
      },
  ]))

  return appIcon
}
