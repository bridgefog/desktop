import alt from '../alt'
import playerActions from '../actions/player'

class PlayerStore {
  constructor () {
    this.bindListeners({
      togglePlayPause: playerActions.togglePlayPause,
      playTrack: playerActions.playTrack,
      updatePlayingStats: playerActions.updatePlayingStats,
      _setCurrentTime: playerActions.setCurrentTime,
      trackEnded: playerActions.trackEnded,
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
    this.playingStats = {}
  }

  updatePlayingStats(stats) {
    this.playingStats = stats
  }

  _setCurrentTime(time) {
    this.setCurrentTime = time
  }

  trackEnded(trackID) {
    this.isPlaying = false
    console.log('ended', trackID)
    this.playingID = null
    this.playingArtist = null
    this.playingTitle = null
    this.trackLoaded = false
  }
}

export default alt.createStore(PlayerStore, 'PlayerStore')
