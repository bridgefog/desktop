import alt from '../alt'
import playerActions from '../actions/player'

class PlayerStore {
  constructor () {
    this.bindListeners({
      togglePlayPause: playerActions.togglePlayPause,
      playTrack: playerActions.playTrack,
    })

    this.playing = false
  }

  togglePlayPause() {
    this.playing = (this.id && !this.playing)
  }

  playTrack({id, artist, title}) {
    console.log('playTrack', id, artist, title)
    this.id = id
    this.artist = artist
    this.title = title
    this.playing = true
    this.trackLoaded = true
  }
}

export default alt.createStore(PlayerStore, 'PlayerStore')
