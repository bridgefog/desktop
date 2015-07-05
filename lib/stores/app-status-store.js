import ipc from 'ipc'

import alt from '../alt'
import actions from '../actions/app-status'

class AppStatusStore {
  constructor() {
    this.needsRestart = false
    this.restarting = false

    this.bindListeners({
      setNeedsRestart: actions.needsRestart,
      restartNow: actions.restartNow,
      willRestart: actions.willRestart,
    })
  }

  setNeedsRestart() {
    this.needsRestart = true
  }

  restartNow() {
    ipc.send('restart-app')
  }

  willRestart() {
    this.restarting = true
  }
}

export default alt.createStore(AppStatusStore)
