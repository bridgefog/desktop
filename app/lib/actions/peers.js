import alt from '../alt'

class PeerActions {
  add(peer) {
    this.dispatch(peer)
  }
}

export default alt.createActions(PeerActions)
