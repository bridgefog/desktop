'use strict'

process.env.NODE_DEBUG = 'ipfs'

var util = require('util')
var EventEmmitter = require('events')
var immutable = require('immutable')
var R = require('ramda')
var atm = require('atm-common')
var ipfs = atm.IPFSClient(window.location.origin)
var clubnet = atm.Clubnet(ipfs)
var $ = require('jquery')

function handleError(reason) {
  console.log('FAILED', reason)
  if (reason instanceof Error) { console.log(reason.stack) }
  $('#error').append(reason.toString()).show()
}

function log() {
  $('#log').append(util.format.call(arguments) + '\n')
}

class PeerFetcher extends EventEmmitter {
  constructor(clubnet, badgeBuilderFunc) {
    this.buildBadge = badgeBuilderFunc
    this.peerlist = immutable.Set()
    this.clubnet = clubnet
  }

  start() {
    this.timeout = setInterval(() => this.fetchPeers(), 90000)
    this.fetchPeers()
  }

  fetchPeers() {
    var self = this
    return this.clubnet.findPeers(this.buildBadge()).then(function (peers) {
      peers.forEach(function (peerId) {
        if (!self.peerlist.has(peerId)) {
          self.emit('newPeer', peerId)
        }
        self.emit('peer', peerId)
        self.peerlist = self.peerlist.union([peerId])
      })
      return self.peerlist
    })
  }
}

var peerFetcher = new PeerFetcher(clubnet, function () { return new atm.Badge() })
peerFetcher.start()
peerFetcher.on('newPeer', function (peerId) {
  log('Found new peer', peerId)
})

// TODO: Wear badge
peerFetcher.on('peer', function (peerId) {
  ipfs.nameResolve(peerId).
    then(resolvedKey => ipfs.objectGet(resolvedKey + '/allthemusic/contents')).
    then(thisPeersContents => immutable.Set().union(R.pluck('Hash', thisPeersContents.Links))).
    then(function (contents) {
    console.log('contents =', contents)

    contents.forEach(function (key) {
      ipfs.objectGet(key).then(function (object) {
        var metadata = JSON.parse(object.Data)
        console.log('BOB got metadata for', key, '=', metadata)
        $('#list').append('<li>' + metadata.artist + ' - ' + metadata.title + '</li>')
      }).catch(handleError)
    })
  }).catch(handleError)
})
