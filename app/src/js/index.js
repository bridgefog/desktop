'use strict'

process.env.NODE_DEBUG = 'ipfs'

import util from 'util'
import { Set } from 'immutable'
import react from 'react'
import { Dispatcher } from 'flux'
import R from 'ramda'
import $ from 'jquery'
import { IPFSClient, Clubnet, Badge } from 'atm-common'

var songlist = new Set()
var publishedKeys = new Set()

var dispatcher = new Dispatcher()

function handleError(reason) {
  console.log('FAILED', reason)
  if (reason instanceof Error) { console.log(reason.stack) }
  var newEl = $('<p class="error"><code>' + reason.toString() + '</code></p>')
  $('#log').append(newEl).show()
  newEl[0].scrollIntoView()
}

function log() {
  var newEl = $('<p class="info"><code>' + util.format.apply(util, arguments) + '</code></p>')
  $('#log').append(newEl).show()
  newEl[0].scrollIntoView()
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
    if (songlist.has(key)) { return }
    ipfs.objectGet(key)
      .then(object => {
        songlist = songlist.add(key)
        var metadata = JSON.parse(object.Data)
        $('#list tbody').append('<tr><td>' + metadata.artist + '</td><td>' + metadata.title + '</td></tr>')
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
  ipfs.nameResolve(peerId)
    .then(resolvedKey => {
      if (!publishedKeys.has(resolvedKey)) {
        decoratePeerId(peerId).then(peerId =>
          log('Peer', peerId, 'name resolved to new key', resolvedKey))
        publishedKeys = publishedKeys.add(resolvedKey)
        return ipfs.objectGet(resolvedKey + '/allthemusic/contents').then(fetchPeersContents)
      }
    })
    .catch(handleError)
})

getPeers()

global.clubnet = clubnet
