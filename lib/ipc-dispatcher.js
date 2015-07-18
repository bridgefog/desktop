import ipc from 'ipc'
import appStatusActions from './actions/app-status'
import playerActions from './actions/player'

ipc.on('app-will-restart', (event, args) => {
  appStatusActions.willRestart()
  console.log('App will restart!')
})

ipc.on('restart-required', () => {
  appStatusActions.needsRestart()
})

ipc.on('log', (event, arg) => {
  console.log(arg)
})

ipc.on('toggle-play-pause', () => {
  playerActions.togglePlayPause()
})
