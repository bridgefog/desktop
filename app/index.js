'use strict'

var immutable = require('immutable')
var R = require('ramda')
var atm = require('atm-common')
var ipfs = atm.IPFSClient(window.location.origin)
var $ = require('jquery')

var peerlist = immutable.Set()

function fetchPeers() {
  // TODO: build peerlist using DHT query. For now, just hard-coded:
  peerlist = peerlist.union(['QmQWieUBw1aoqofViCfHcqyEKNxE5XBQX7VtrWcNmhDkGk'])
  return Promise.resolve(peerlist)
}

// TODO: Wear badge
fetchPeers().then(function () {
  return ipfs.nameResolve(peerlist.first())
}).then(function (resolvedKey) {
  return ipfs.objectGet(resolvedKey + '/allthemusic/contents')
}).then(function (thisPeersContents) {
  return immutable.Set().union(R.pluck('Hash', thisPeersContents.Links))
}).then(function (contents) {
  console.log('contents =', contents)

  contents.forEach(function (key) {
    ipfs.objectGet(key).then(function (object) {
      var metadata = JSON.parse(object.Data)
      console.log('BOB got metadata for', key, '=', metadata)
      $('#list').append('<li>' + metadata.artist + ' - ' + metadata.title + '</li>')
    })
  })
}).catch(function (reason) {
  console.log('FAILED', reason)
  if (reason instanceof Error) {
    console.log(reason.stack)
  }
})
