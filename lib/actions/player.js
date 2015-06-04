import alt from '../alt'

class PlayerActions {
  togglePlayPause() {
    this.dispatch()
  }

  playTrack(id, artist, title) {
    this.dispatch({ id: id })
  }
}

export default alt.createActions(PlayerActions)
