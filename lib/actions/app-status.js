import alt from '../alt'

class AppStatusActions {
  needsRestart() {
    this.dispatch()
  }

  restartNow() {
    this.dispatch()
  }

  willRestart() {
    this.dispatch()
  }
}

export default alt.createActions(AppStatusActions)
