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

  togglePlayPause () {
    this.playing = !this.playing
  }

  playTrack({key}) {
    this.key = key
    this.playing = true
  }
}

export default alt.createStore(PlayerStore, 'PlayerStore')
