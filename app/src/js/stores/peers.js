import { Map, Record } from 'immutable'
import alt from '../alt'
import peerActions from '../actions/peers'

export var Peer = Record({
  key: null,
  status: null,
  lastSeen: null,
})

class PeerStore {
  constructor() {
    this.peers = new Map()

    this.bindListeners({
      add: peerActions.ADD,
    })
  }

  add(peer) {
    this.peers = this.peers.set(peer.key, peer)
  }
}
export default alt.createStore(PeerStore, 'PeerStore')
