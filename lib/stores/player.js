import alt from '../alt'
import playerActions from '../actions/player'

class PlayerStore {
  constructor () {
    this.bindListeners({
      togglePlayPause: playerActions.togglePlayPause
    })

    this.src = 'http://localhost:8080/ipfs/QmTAZpbrLnHETbjmjuhDrur5LjUs4z2sAiaNpbUJYyfdpu'
    this.playing = false
  }

  togglePlayPause () {
    this.playing = !this.playing
  }
}

export default alt.createStore(PlayerStore, 'PlayerStore')
