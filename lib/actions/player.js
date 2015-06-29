import alt from '../alt'

class PlayerActions {
  togglePlayPause() {
    this.dispatch()
  }

  playTrack({id, artist, title}) {
    this.dispatch({ id, artist, title })
  }

  trackEnded(id) {
    this.dispatch(id)
  }

  updatePlayingStats(stats) {
    this.dispatch(stats)
  }

  setCurrentTime(time) {
    this.dispatch(time)
  }
}

export default alt.createActions(PlayerActions)
