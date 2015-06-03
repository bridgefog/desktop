import alt from '../alt'

class PlayerActions {
  togglePlayPause() {
    this.dispatch()
  }

  playTrack(key) {
    console.log('playing: ' + key)
    this.dispatch({ key: key })
  }
}

export default alt.createActions(PlayerActions)
