import alt from '../alt'
import playerActions from '../actions/player'

class PlayerStore {
  constructor () {
    this.bindListeners({
      togglePlayPause: playerActions.togglePlayPause,
      playTrack: playerActions.playTrack,
      updatePlayingStats: playerActions.updatePlayingStats,
      setCurrentTime: playerActions.setCurrentTime,
    })

    this.isPlaying = false
  }

  togglePlayPause() {
    this.isPlaying = (this.playingID && !this.isPlaying)
  }

  playTrack({id, artist, title}) {
    this.playingID = id
    this.playingArtist = artist
    this.playingTitle = title
    this.isPlaying = true
    this.trackLoaded = true
  }

  updatePlayingStats(stats) {
    this.playingStats = stats
  }

  setCurrentTime(time) {
    this.setCurrentTime = time
  }
}

export default alt.createStore(PlayerStore, 'PlayerStore')
