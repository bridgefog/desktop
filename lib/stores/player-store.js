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

  playTrack({id}) {
    console.log('playTrack', id)
    this.id = id
    this.playing = true
  }
}

export default alt.createStore(PlayerStore, 'PlayerStore')
