'use strict'

require.main.paths.splice(0, 0, process.env.NODE_PATH)

import util from 'util'
import { Set } from 'immutable'
import React from 'react'
import R from 'ramda'
import { IPFSClient, util as ipfsUtil } from 'atm-ipfs-api'
import Clubnet from './clubnet'
import Badge from './badge'
import peerActions from './actions/peers'
import trackActions from './actions/tracks'
import { Peer } from './stores/peer-store'
import decorateHash from './hash-decorator'
import App from './components/app'

var publishedKeys = new Set()

function handleError(reason) {
  console.log('FAILED', reason)
  if (reason instanceof Error) { console.log(reason.stack) }
}

function log() {
  console.log(util.format.apply(util, arguments))
}

function getPeers() {
  clubnet.findPeers().then(() => {
    setTimeout(getPeers, 9000)
  }).catch(e => {
    handleError(e)
    setTimeout(getPeers, 9000)
  })
}

var knownTracks = []
var tracksToUpdate = []

function updateTracks() {
  if (tracksToUpdate.length > 0) {
    trackActions.addMulti(tracksToUpdate)
    tracksToUpdate = []
  }
  setTimeout(updateTracks, 500)
}

function fetchPeersContents(thisPeersContents) {
  var contents = new Set().union(R.pluck('Hash', thisPeersContents.Links))

  contents.forEach(id => {
    if (knownTracks.indexOf(id) < 0) {
    knownTracks.push(id)
    ipfs.objectGet(id)
      .then(object => {
        var metadata = JSON.parse(object.Data)
        metadata.id = id
        tracksToUpdate.push(metadata)
      })
      .catch(handleError)
    }
  })
}

var ipfs = new IPFSClient(ipfsUtil.ipfsEndpoint())
var clubnet = new Clubnet(ipfs, () => new Badge())

var getMyId = ipfs.peerID().catch(handleError)
getMyId.then(myID => clubnet.addPeer(myID))

function decoratePeerId(peerId) {
  var dPeerId = decorateHash(peerId)
  return getMyId
    .then(myID => '[' + (peerId === myID ? `${dPeerId} (local node)` : dPeerId) + ']')
}

clubnet.on('newPeer', peerId => {
  decoratePeerId(peerId).then(peerId => log('Found new peer: ', peerId))
})

clubnet.on('peer', function (peerId) {
  var p = new Peer({ key: peerId })
  peerActions.add(p)
  ipfs.nameResolve(peerId)
    .then(resolvedKey => {
      if (!publishedKeys.has(resolvedKey)) {
        decoratePeerId(peerId).then(peerId =>
          log('Peer', peerId, 'name resolved to new key', resolvedKey))
        return ipfs.objectGet(resolvedKey + '/allthemusic/contents')
          .then(fetchPeersContents)
      }
    })
    .catch(handleError)
})

getPeers()
updateTracks()

React.render(<App />, document.getElementById('content'))
