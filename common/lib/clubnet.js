'use strict'

import EventEmitter from 'events'
import { Set } from 'immutable'
import mapStream from 'through2-map'
import { concatP } from './util'

export default class Clubnet extends EventEmitter {
  constructor(ipfsClient, badgeBuilderFunc) {
    super()
    this.buildBadge = badgeBuilderFunc
    this.ipfsClient = ipfsClient
    this.badge = this.buildBadge()
    this.peerlist = new Set()
  }

  wearBadge() {
    this.updateBadge()
    this.emit('wearBadge:start')

    return this.ipfsClient.objectPut(this.badge.dagObject()).then(result => {
      this.badge.setHash(result)
      this.emit('wearBadge:done')
      return this.badge
    })
  }

  updateBadge() {
    var newBadge = this.buildBadge()

    if (newBadge.name != this.badge.name) {
      this.emit('badgeChanged', newBadge)
      this.badge = newBadge
    }
  }

  addPeer(peerId) {
    if (!this.peerlist.has(peerId)) {
      this.emit('newPeer', peerId)
    }
    this.emit('peer', peerId)
    this.peerlist = this.peerlist.add(peerId)
    return peerId
  }

  findPeers() {
    this.updateBadge()

    // TODO: This is not the correct behavior, but for now, if we don't yet have
    // a hash stored in the badge, the only way to learn the hash is to add it
    // to IPFS
    var badgeP = this.badge.hash() ? Promise.resolve(this.badge) : this.wearBadge()

    return badgeP.then(badge => {
      this.emit('findPeers:start')
      return this.ipfsClient.dhtFindprovs(badge.hash())
        .then(stream => stream.pipe(mapStream.obj(peer => this.addPeer(peer.ID))))
        .then(concatP)
        .then(peers => {
          this.emit('findPeers:done')
          return peers
        })
    })
  }
}
