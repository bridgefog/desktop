import alt from '../alt'

class PlayerActions {
  togglePlayPause() {
    console.log('actions')
    this.dispatch()
  }
}

export default alt.createActions(PlayerActions)
