'use strict'

import util from 'util'
import { Set } from 'immutable'
import React from 'react'
import R from 'ramda'
import { IPFSClient } from 'atm-ipfs-api'
import Clubnet from './clubnet'
import Badge from './badge'
import peerActions from './actions/peers'
import trackActions from './actions/tracks'
import { Track } from './stores/tracks'
import { Peer } from './stores/peers'
import Peerlist from './components/peerlist'
import Tracklist from './components/tracklist'

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

function fetchPeersContents(thisPeersContents) {
  var contents = new Set().union(R.pluck('Hash', thisPeersContents.Links))

  contents.forEach(key => {
    ipfs.objectGet(key)
      .then(object => {
        var metadata = JSON.parse(object.Data)
        metadata.key = key
        trackActions.add(new Track(metadata))
        console.log(metadata)
        // $('#list tbody').append('<tr><td>' + metadata.artist + '</td><td>' + metadata.title + '</td></tr>')
      })
      .catch(handleError)
  })
}

var ipfs = new IPFSClient(window.location.origin)
var clubnet = new Clubnet(ipfs, () => new Badge())

var getMyId = ipfs.peerID().catch(handleError)
function decoratePeerId(peerId) {
  return getMyId
    .then(myID => '[' + (peerId === myID ? 'local node' : peerId) + ']')
}

clubnet.on('newPeer', peerId => {
  decoratePeerId(peerId).then(peerId => log('Found new peer: ', peerId))
})

clubnet.on('peer', function (peerId) {
  var p = new Peer({ key: peerId })
  peerActions.add(p.set('status', 'resolving'))
  ipfs.nameResolve(peerId)
    .then(resolvedKey => {
      if (!publishedKeys.has(resolvedKey)) {
        decoratePeerId(peerId).then(peerId =>
          log('Peer', peerId, 'name resolved to new key', resolvedKey))
        publishedKeys = publishedKeys.add(resolvedKey)

        peerActions.add(p.set('status', 'getting contents'))
        var promise = ipfs.objectGet(resolvedKey + '/allthemusic/contents')
        promise.then(() => {
          peerActions.add(p)
        })
        return promise.then(fetchPeersContents)
      }
    })
    .catch(handleError)
})

getPeers()

global.clubnet = clubnet

var Content = React.createClass({
  render: function () {
    var style = {
      border: '5px solid black',
      margin: '1em',
      padding: '1em',
    }
    return (
      <div style={style}>
        <Tracklist />
        <Peerlist />
      </div>
    )
  }
})

React.render(<Content />, document.getElementById('content'))

global.peerActions = peerActions
