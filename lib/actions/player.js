import alt from '../alt'

class PlayerActions {
  togglePlayPause() {
    this.dispatch()
  }

  playTrack({id, artist, title}) {
    this.dispatch({ id, artist, title })
  }

  updatePlayingStats(stats) {
    this.dispatch(stats)
  }
}

export default alt.createActions(PlayerActions)
